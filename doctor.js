#! /usr/bin/env node

const doctor_version = "v1.0.0-rc.28"
const doctor_site_url = "https://madprops.github.io/Doctor/"

const time_start = Date.now()
const fs = require("fs")
const path = require("path")
const cheerio = require("cheerio")
const file_path = process.argv[2]
const output_path = process.argv[3]
const objects = []

function init()
{
	show_intro()

	if(!file_path)
	{
		print_error("No input file specified.")
		return false
	}

	try
	{
		var file_content = fs.readFileSync(file_path, "utf-8")
	}

	catch(err)
	{
		print_error("There was a problem loading that file. Check that the path is correct.")
		return false
	}

	file_content = do_safe_parses(file_content)

	if(!file_content)
	{
		return false
	}

	if(!get_elements(file_content))
	{
		return false
	}

	create_file(generate_html())

	show_duration()
}

function get_elements(fcontent)
{
	const $ = cheerio.load(fcontent)

	var elements_ok = true

	$("code").each(function()
	{
		if($(this).parents("code").length > 0)
		{	
			return true
		}

		$(this).html($(this).html().replace(/</g, "&lt;").replace(/>/g, "&gt;"))

		let h = dummy_space(fix_code_sample($(this).html()))

		let ns = `<i><blockquote class='doctor_code_sample'><pre><code>${h}</code></pre></blockquote></i>`
		
		$(this).replaceWith(ns)
	})

	const elements = $("doc")

	elements.each(function()
	{
		let type = Object.keys($(this).attr())[0]

		let content

		if(type === "style" || 
		   type === "script" || 
		   type === "title" || 
		   type === "favicon" || 
		   type === "head" || 
		   type === "theme")
		{
			content = $(this).text().trim()
		}

		else
		{
			content = $(this).html().trim()
			content = clean_string2(replace_linebreaks(content))
		}

		content = dummy_space(content, false)

		let attributes = $(this).attr()

		if(!type || !content)
		{
			print_error("Error parsing the document.")
			elements_ok = false
			return false
		}

		objects.push({type:type, content:content, attributes:attributes})
	})

	return elements_ok
}

function generate_html()
{
	var header = ""
	var description = ""
	var style = ""
	var script = ""
	var head = ""
	var title = ""
	var theme = "#757593"
	var sections = []
	var sections_menu_html = ""
	var sections_html = ""
	var edge_sections_menu = ""
	var favicon = ""
	var keyboard = true

	for(let obj of objects)
	{
		if(obj.type === "header")
		{
			header = obj.content
		}

		else if(obj.type === "description")
		{
			description = obj.content
		}

		else if(obj.type === "section")
		{
			sections.push(obj)
		}

		else if(obj.type === "style")
		{
			style = obj.content
		}

		else if(obj.type === "script")
		{
			script = obj.content
		}

		else if(obj.type === "head")
		{
			head = obj.content
		}

		else if(obj.type === "title")
		{
			title = obj.content
		}

		else if(obj.type === "theme")
		{
			theme = obj.content
		}

		else if(obj.type === "favicon")
		{
			favicon = obj.content
		}
		
		else if(obj.type === "keyboard")
		{
			keyboard = JSON.parse(obj.content)
		}
	}

	if(!title && header)
	{
		title = header
	}

	if(sections.length > 0)
	{
		let num = 0
		let i = 0
		let cnames = []

		for(let section of sections)
		{
			num += 1
			i += 1

			let name = section.attributes.name
			let cname = encodeURI(clean_string(section.attributes.name)).toLowerCase()

			if(cnames.includes(cname))
			{
				let n = 2

				for(let i=0; i<cnames.length; i++)
				{
					let ncname = `${cname}${n}`

					if(!cnames.includes(ncname))
					{
						cname = ncname
						break
					}

					else
					{
						n += 1
					}
				}
			}

			cnames.push(cname)

			let section_id = `doctor_section_id_${cname}`
			
			sections_menu_html += `<a href="#${cname}" class='doctor_section_anchor_link' data-section-id='${section_id}'>${name}</a>`
			
			edge_sections_menu += `<a data-section-id='${section_id}' class="doctor_edge_menu_item doctor_section_anchor_link" href="#${cname}">${name}</a>`

			if(i < sections.length)
			{
				if(num < 5)
				{
					sections_menu_html += "&nbsp;&nbsp;|&nbsp;&nbsp;"
				}

				else
				{
					sections_menu_html += "<br><br>"
					num = 0
				}
			}

			sections_html += `
			<div class='doctor_section' id='${section_id}'>

				<hr class='doctor_section_separator'>

				<a name="${cname}" class='doctor_section_anchor'></a>

				<div class='doctor_section_header_container'>
					<h2 class='doctor_section_header'>${name}</h2>
					<h2 class='doctor_section_feedback'>*</h2>
				</div>

				<div class='doctor_section_content_container'>
					${section.content}
				</div>

			</div>
			`
		}
	}

	if(!favicon)
	{
		favicon = "data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAqKi1ADIycwBZWb4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIiIiIAAAAAEREREgAAAAARERESAAAAABMzMxIAAAAAEzMzEgAAAAARERESAAAAABERERIAAAAAIiIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD//wAA8A8AAPAPAADwDwAA8A8AAPAPAADwDwAA8A8AAPAPAAD//wAA//8AAP//AAD//wAA"
	}

	var s = `
	<!doctype html>

	<!-- Code generated by Doctor ${doctor_version} -->
	<!-- ${doctor_site_url} -->

	<html>

	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>${title}</title>
		<link rel='shortcut icon' href='${favicon}' type='image/x-icon'>
		<style>

			:root 
			{
				--fcolor: rgba(0, 0, 0, 0.9);
				--wcolor: rgba(255, 255, 255, 0.9);
				--tcolor: ${theme};
			}

			body, html
			{
				font-family: sans-serif;
				padding: 0;
				margin: 0;
				font-size: 18px;
				background-color: white;
				color: var(--fcolor);
				scroll-behavior:smooth;
				width: 100%;
				height: 100%;
			}

			#doctor_rows
			{
				display: flex;
				flex-direction: row;
				min-height: 100%;
				min-width: 100%;
			}

			#doctor_main
			{
				flex-grow: 1;
				flex-shrink: 1;
				height: 100%;
				margin: 0 auto;
				padding-left: 2em;
				padding-right: 2em;
				background-color: white;
				color: var(--fcolor);
			}

			#doctor_left_edge 
			{
				background-color: var(--tcolor);
				color: var(--wcolor);
				flex-grow: 0;
				flex-shrink: 0;
				width: 4rem;
				min-height: 100%;
				cursor: pointer;
				position: relative;
			}

			h1, h2
			{
				letter-spacing: 0.1em;
				padding: 0;
				margin: 0;
			}

			h1
			{
				padding-top: 1.4rem;
				padding-bottom: 1rem;
			}

			h2
			{
				padding-top: 0.4rem;
				padding-bottom: 1rem;
			}

			.doctor_section_separator
			{
				margin-top: 2rem;
				margin-bottom: 1.7rem;
				border: 0;
				height: 0;
				border-top: 1px solid rgba(0, 0, 0, 0.1);
				border-bottom: 1px solid rgba(255, 255, 255, 0.3);
			}

			a:visited, a:link, a:hover
			{
				color: var(--tcolor);
				text-decoration: none;
				transition: text-shadow 500ms;
			}

			a:hover
			{
				text-shadow: 0 0 1em currentColor;
			}

			img 
			{
			    max-width: 100%;
			}

			#doctor_top_menu
			{
				position: fixed;
				left: 50%;
				transform: translateX(-50%);
				top: 0;
				flex-direction: row;
				opacity: 0;
				background-color: white;
				color: var(--fcolor);
				border-left: 1px solid grey;
				border-bottom: 1px solid grey;
				border-right: 1px solid grey;
				padding: 10px;
				display: flex;
				transition: opacity 500ms;
			}

			#doctor_prev_button
			{
				border-right: 1px solid grey;
				padding-right: 1rem;
				cursor: pointer;
			}

			#doctor_next_button
			{
				border-left: 1px solid grey;
				padding-left: 1rem;
				cursor: pointer;
			}

			#doctor_top_button
			{
				padding-left: 1rem;
				padding-right: 1rem;
				cursor: pointer;
			}

			#doctor_bottom_button
			{
				border-left: 1px solid grey;
				padding-left: 1rem;
				padding-right: 1rem;
				cursor: pointer;
			}

			.doctor_unselectable
			{
				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
			}

			blockquote, pre
			{
				margin: 0;
			}

			blockquote
			{
				display: inline-block;
				background-color: #f5f5f5;
				padding-left: 0.1em;
				padding-right: 0.1em;
				box-shadow: 0 0 1px #adadad;
			}

			.doctor_section
			{
				padding-top: 0.5em;
			}

			.doctor_section_header_container
			{
				display: flex;
				flex-direction: row;
				white-space: nowrap;
				overflow: hidden;
			}

			.doctor_section_header
			{
				display: inline-block;
				white-space: initial;
			}

			.doctor_section_feedback
			{
				display: inline-block;
				visibility: hidden;
				margin-left: 1rem;
			}

			.doctor_section_anchor
			{
				display: block;
			}

			#doctor_edge_menu
			{
				position: fixed;
				top: 0;
				left: -30rem;
				width: 30rem;
				height: 100vh;
				background-color: var(--tcolor);
				transition: left 300ms ease-in-out;
				z-index: 999;
			}

			#doctor_edge_menu_columns
			{
				display: flex;
				flex-direction: column;
				width: 100%;
				height: 100%;
				align-items: center;
				justify-content: center;
			}

			#doctor_edge_menu_main
			{
				visibility: hidden;
				opacity: 0;
				transition: opacity 800ms ease-in-out;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100%;
				width: 100%;
			}

			#doctor_edge_menu_header
			{
				padding-bottom: 0.4rem;
			}

			#doctor_edge_menu_search_input
			{
				font-size: 1rem;
				padding: 0.1rem;
				width: 14rem;
				color: var(--tcolor);
				background-color: white;
				text-align: center;
				margin-bottom: 1rem;
			}

			#doctor_edge_menu_close_container
			{
				height: 4rem;
			}

			#doctor_edge_menu_close
			{
				position: absolute;
				right: 0;
				top: 0;
				color: var(--wcolor);
				padding: 0.5em;
				font-size: 1.1em;
				cursor: pointer;
				background-color: inherit;
			}

			#doctor_edge_menu_content
			{
				width: 90%;
				height: 90%;
				overflow: auto;
			}

			#doctor_edge_menu_content_inner
			{
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				flex-grow: 0;
				flex-shrink: 1;
			}

			#doctor_about_container
			{
				text-align: center;
				height: 2rem;
			}

			#doctor_about
			{
				position: absolute;
				bottom: 0.5rem;
				left: 50%;
				font-size: 0.7rem;
				transform: translateX(-50%);
				color: var(--wcolor);
				cursor: pointer;
				text-decoration: none;
			}

			a.doctor_edge_menu_item:visited, a.doctor_edge_menu_item:link, a.doctor_edge_menu_item:hover
			{
				color: var(--wcolor);
				font-size: 1.2rem;
				margin-top: 1rem;
				margin-bottom: 1rem;
				text-align: center;
			}

			#doctor_edge_menu_main h2
			{
				color: var(--wcolor);
				cursor: pointer;
			}

			.doctor_action
			{
				transition: text-shadow 500ms;
			}

			.doctor_action:hover
			{
				text-shadow: 0 0 1em currentColor;
			}

			#doctor_overlay
			{
				position: fixed;
				top: 0;
				left: 0;
				height: 100%;
				width: 100%;
				background-color: rgba(0, 0, 0, 0.8);
				z-index: 9999;
				display: none;
				cursor: pointer;
			}

			#doctor_modal
			{
				position: fixed;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				background-color: transparent;
				z-index: 99999;
				width: 90%;
				height: 90%;
				display: none;
				overflow: hidden;
				cursor: pointer;
			}

			#doctor_modal_inner
			{
				position: relative;
				height: 100%;
				width: 100%;
				max-height: 100%;
				max-width: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			#doctor_modal_inner img
			{
				width: 100%;
				height: 100%;
				object-fit: contain;
			}

		 	#doctor_main img
			{
				cursor: pointer;
			}

			.doctor_edge_menu_item_highlight
			{
				text-decoration: underline !important;
			}

		</style>

		<style>
			${style}
		</style>

		${head}

	</head>

	<body>

		<div id='doctor_rows'>

			<div id='doctor_top_menu' class='doctor_unselectable'>
				<div id='doctor_prev_button' class='doctor_action' onclick='doctor_go_to_anchor()'>Prev</div>
				<div id='doctor_top_button' class='doctor_action' onclick='doctor_go_to_top()'>Top</div>
				<div id='doctor_bottom_button' class='doctor_action' onclick='doctor_go_to_bottom()'>Bottom</div>
				<div id='doctor_next_button' class='doctor_action' onclick='doctor_go_to_anchor(false)'>Next</div>
			</div>

			<div id='doctor_left_edge' onclick='doctor_left_edge_click()'></div>

			<div id='doctor_overlay' onclick='doctor_hide_modal()'></div>

			<div id='doctor_modal' onclick='doctor_hide_modal()'>
				<div id='doctor_modal_inner'></div>
			</div>

			<div id='doctor_edge_menu'>
				<div id='doctor_edge_menu_main' class='doctor_unselectable'>
					<div id='doctor_edge_menu_columns'>
						<div id='doctor_edge_menu_close_container'>
							<div id='doctor_edge_menu_close' class='doctor_action' onclick='doctor_hide_edge_menu()'>Close</div>
						</div>
						<div id='doctor_edge_menu_content'>
							<div id='doctor_edge_menu_content_inner'>
								<h2 id='doctor_edge_menu_header' class='doctor_action' onclick="doctor_go_to_top();doctor_hide_edge_menu()">${header}</h2>
								<input id='doctor_edge_menu_search_input' type='text' placeholder='Search'>
								${edge_sections_menu}
							</div>
						</div>
						<div id='doctor_about_container'>
							<a id='doctor_about' target='_blank' href='${doctor_site_url}'>Doctor ${doctor_version}</a>
						</div>
					</div>
				</div>
			</div>
			<div id='doctor_main'>
				<h1>${header}</h1>
				<div>${description}</div>
				<br>
				<div>
					<div class='doctor_sections_menu'>
						${sections_menu_html}
					</div>
				</div>
				<div>
					${sections_html}
				</div>
				<br><br><br><br>
			</div>

		</div>

		${generate_javascript({keyboard:keyboard})}

		<script>${script}</script>

	</body>

	</html>
	`

	return s
}

function create_file(html)
{
	var file_name

	if(output_path)
	{
		file_name = output_path
	}

	else
	{
		file_name = `${path.dirname(file_path)}/index.html`
	}

	var stream = fs.createWriteStream(file_name)

	stream.once('open', function(fd)
	{
		stream.end(html)
	})

	print_success(`Output filed saved in: ${file_name}`)
}

function replace_linebreaks(s)
{
	return s.replace(/\n/g, "<br>")
}

function clean_string(s)
{
	return s.replace(/\s+/g, '').trim()
}

function clean_string2(s)
{
	return s.replace(/\s+/g, ' ').trim()
}

function dummy_space(s, add=true)
{
	if(add)
	{
		return s.replace(/\n/g, "[x[docnewline]x]").replace(/\s/g, "[x[docspace]x]")
	}

	else
	{
		return s.replace(/\[x\[docnewline\]x\]/g, "\n").replace(/\[x\[docspace\]x\]/g, " ")
	}
}

function dummy_space2(s, add=true)
{
	if(add)
	{
		return s.replace(/\n/g, "[x[docnewline]x]").replace(/ /g, "[x[docspace]x]").replace(/\t/g, "[x[doctab]x]")
	}

	else
	{
		return s.replace(/\[x\[docnewline\]x\]/g, "\n").replace(/\[x\[docspace\]x\]/g, " ").replace(/\[x\[doctab\]x\]/g, "\t")
	}
}

function fix_code_sample(s)
{
	s = s.replace(/\t/g, "    ")

	let lines = s.split("\n")

	let min

	let ns = []

	for(let line of lines)
	{
		let line2 = line.replace(/^\s*$/, "[x[docempty]x]")

		if(line.trim())
		{
			let i = line.search(/\S/)

			if(min === undefined)
			{
				min = i
			}

			else
			{
				if(i < min)
				{
					min = i
				}
			}

		}
		
		ns.push(line2)
	}

	s = ns.join("\n")

	if(min > 0)
	{
		lines = s.split("\n")

		ns = []

		let ts = ""

		for(let i=0; i<min; i++)
		{
			ts += " "
		}

		var rep = new RegExp(`^${ts}`, "g")

		for(let line of lines)
		{
			line = line.replace(rep, "")
			ns.push(line)
		}

		s = ns.join("\n")
	}

	s = s.replace(/\[x\[docempty\]x\]/g, "").trim()

	return s
}

function generate_javascript(options)
{
	var keyboard_events = ""
	var menu_keyboard_escape_1 = ""

	if(options.keyboard)
	{
		keyboard_events = `
			document.addEventListener("keyup", function(e)
			{
				if(e.key === "Escape")
				{
					if(!doctor_edge_menu_open)
					{
						doctor_show_edge_menu()
					}

					else
					{
						doctor_reset_or_hide_menu()
					}
				}
			})
		`

		menu_keyboard_escape_1 = "e.preventDefault();return false;"
	}

	var script = `
		<script>

			var doctor_scroll_timer
			var doctor_check_scroll_delay = 100
			var doctor_search_delay = 200
			var doctor_edge_menu_item_selected = -1
			var doctor_edge_menu_items_filtered = []
			var doctor_edge_menu_open = false

			var doctor_main = document.getElementById("doctor_main")
			var doctor_bottom_button = document.getElementById("doctor_bottom_button")
			var doctor_next_button = document.getElementById("doctor_next_button")
			var doctor_top_menu = document.getElementById("doctor_top_menu")
			var doctor_modal = document.getElementById("doctor_modal")
			var doctor_modal_inner = document.getElementById("doctor_modal_inner")
			var doctor_overlay = document.getElementById("doctor_overlay")
			var doctor_edge_menu = document.getElementById("doctor_edge_menu")
			var doctor_edge_menu_main = document.getElementById("doctor_edge_menu_main")
			var doctor_edge_menu_content_inner = document.getElementById("doctor_edge_menu_content_inner")
			var doctor_edge_menu_search_input = document.getElementById("doctor_edge_menu_search_input")
			var doctor_edge_menu_items = Array.from(document.querySelectorAll(".doctor_edge_menu_item"))

			window.onload = function()
			{
				doctor_scroll_timer = (function()
				{
					var timer

					return function()
					{
						clearTimeout(timer)

						timer = setTimeout(function()
						{
							doctor_check_scroll()
						}, doctor_check_scroll_delay)
					}
				})()

				doctor_search_timer = (function()
				{
					var timer

					return function()
					{
						clearTimeout(timer)

						timer = setTimeout(function()
						{
							doctor_search()
						}, doctor_search_delay)
					}
				})()

				window.addEventListener("scroll", function(e)
				{
					doctor_scroll_timer()
				})

				Array.from(document.querySelectorAll(".doctor_edge_menu_item")).forEach(function(el)
				{
					el.addEventListener("click", function()
					{
						doctor_hide_edge_menu()
					})
				})

				doctor_main.addEventListener("click", function(e)
				{
					var el = e.target

					var tag = el.tagName.toLowerCase()

					if(tag === "img")
					{
						doctor_show_modal("<img src='" + el.src + "'>")
					}

					else if(tag === "a")
					{
						if(el.classList.contains("doctor_section_anchor_link"))
						{
							doctor_show_feedback(el.dataset.sectionId)
						}
					}

					if(doctor_edge_menu_open)
					{
						doctor_hide_edge_menu()
					}
				})

				doctor_edge_menu_content_inner.addEventListener("click", function(e)
				{
					var el = e.target

					var tag = el.tagName.toLowerCase()

					if(tag === "a")
					{
						if(el.classList.contains("doctor_section_anchor_link"))
						{
							doctor_show_feedback(el.dataset.sectionId)
						}
					}
				})

				doctor_top_menu.addEventListener("click", function(e)
				{
					if(doctor_edge_menu_open)
					{
						doctor_hide_edge_menu()
					}
				})

				doctor_edge_menu_search_input.addEventListener("keyup", function(e)
				{
					doctor_edge_menu_keyboard_handler(e)
				})				

				doctor_edge_menu_search_input.addEventListener("input", function(e)
				{
					doctor_edge_menu_keyboard_handler(e)
				})

				${keyboard_events}

				doctor_check_scroll()
				doctor_search(false)
			}

			function doctor_reset_or_hide_menu()
			{
				if(doctor_edge_menu_search_input.value.trim())
				{
					doctor_reset_search()
				}

				else
				{
					doctor_hide_edge_menu()
				}
			}

			function doctor_edge_menu_keyboard_handler(e)
			{
				if(e.key === "Escape")
				{
					${menu_keyboard_escape_1}
					doctor_reset_or_hide_menu()
					e.preventDefault()
				}

				else if(e.key === "Enter")
				{
					doctor_go_to_selected_menu_item()
					e.preventDefault()
				}

				else if(e.key === "ArrowUp")
				{
					doctor_menu_item_up()
					e.preventDefault()
				}

				else if(e.key === "ArrowDown")
				{
					doctor_menu_item_down()
					e.preventDefault()
				}

				else
				{
					doctor_search_timer()
				}
			}

			function doctor_menu_item_up()
			{
				if(doctor_edge_menu_item_selected <= 0)
				{
					return false
				}

				doctor_edge_menu_clear_selected()

				let i = doctor_edge_menu_items_filtered.length - 1

				for(let item of doctor_edge_menu_items_filtered.slice().reverse())
				{
					if(i < doctor_edge_menu_item_selected)
					{
						item.classList.add("doctor_edge_menu_item_highlight")
						doctor_edge_menu_item_selected = i
						return
					}

					i -= 1
				}
			}

			function doctor_menu_item_down()
			{
				if(doctor_edge_menu_item_selected >= doctor_edge_menu_items_filtered.length - 1)
				{
					return false
				}

				doctor_edge_menu_clear_selected()

				let i = 0

				for(let item of doctor_edge_menu_items_filtered)
				{
					if(i > doctor_edge_menu_item_selected)
					{
						item.classList.add("doctor_edge_menu_item_highlight")
						doctor_edge_menu_item_selected = i
						return
					}

					i += 1
				}
			}

			function doctor_edge_menu_clear_selected()
			{
				for(let item of doctor_edge_menu_items_filtered)
				{
					item.classList.remove("doctor_edge_menu_item_highlight")
				}
			}

			function doctor_go_to_selected_menu_item()
			{
				if(doctor_edge_menu_item_selected < 0)
				{
					return false
				}

				let item = doctor_edge_menu_items_filtered[doctor_edge_menu_item_selected]
				let section_id = item.dataset.sectionId
				let section = document.getElementById(section_id)
				let anchor = section.querySelector(".doctor_section_anchor")
				doctor_scroll_to_element(anchor)
				doctor_show_feedback(section_id)
				doctor_hide_edge_menu()
			}

			function doctor_reset_search()
			{
				doctor_edge_menu_search_input.value = ""
				doctor_search(false)
				doctor_edge_menu_item_selected = -1
			}

			function doctor_search(highlight=true)
			{
				var lst = []

				var input = doctor_edge_menu_search_input.value.toLowerCase().trim()

				for(let item of doctor_edge_menu_items)
				{
					let section = document.getElementById(item.dataset.sectionId)

					let text = item.innerText.toLowerCase().trim()
					let text2 = section.innerText.toLowerCase().trim()

					if(text.includes(input) || text2.includes(input))
					{
						item.style.display = "initial"
						lst.push(item)
					}

					else
					{
						item.style.display = "none"
					}
				}

				doctor_edge_menu_items_filtered = lst
				doctor_edge_menu_clear_selected()

				if(highlight && doctor_edge_menu_items_filtered.length > 0)
				{
					doctor_edge_menu_item_selected = 0
					doctor_edge_menu_items_filtered[doctor_edge_menu_item_selected].classList.add("doctor_edge_menu_item_highlight")
				}
			}

			function doctor_get_scrollTop()
			{
				return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
			}

			function doctor_get_scrollHeight()
			{
				return document.documentElement.scrollHeight || document.body.scrollHeight || 0
			}

			function doctor_get_clientHeight()
			{
				return document.documentElement.clientHeight || document.body.clientHeight || 0
			}

			function doctor_check_scroll()
			{	
				var scrollTop = Math.round(doctor_get_scrollTop())

				if(scrollTop > 0)
				{
					doctor_show_top_menu()

					var scrollHeight = Math.round(doctor_get_scrollHeight())
					var clientHeight = Math.round(doctor_get_clientHeight())

					let d = scrollHeight - scrollTop

					//This is used to create a range to avoid split pixel miscalculations
					let diff = 4

					if(d - diff < clientHeight || clientHeight + diff > d)
					{
						doctor_bottom_button.style.opacity = 0.5
						doctor_next_button.style.opacity = 0.5
					}

					else
					{
						doctor_bottom_button.style.opacity = 1

						if(doctor_go_to_anchor(false, true))
						{
							doctor_next_button.style.opacity = 1
						}

						else
						{
							doctor_next_button.style.opacity = 0.5
						}
					}
				}

				else
				{
					doctor_hide_top_menu()
				}
			}

			function doctor_show_top_menu()
			{
				doctor_top_menu.style.opacity = "1"
				doctor_top_menu.style.pointerEvents = "initial"
			}

			function doctor_hide_top_menu()
			{
				doctor_top_menu.style.opacity = "0"
				doctor_top_menu.style.pointerEvents = "none"
			}

			function doctor_go_to_top()
			{
				doctor_hide_top_menu()

				window.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			}

			function doctor_go_to_bottom()
			{
				doctor_bottom_button.style.opacity = 0.5
				doctor_next_button.style.opacity = 0.5

				window.scrollTo({
					top: doctor_main.clientHeight,
					behavior: "smooth"
				});
			}

			function doctor_go_to_anchor(prev=true, check=false)
			{
				let scrollTop = doctor_get_scrollTop()

				let max = 0

				if(!prev)
				{
					max = doctor_main.clientHeight
				}

				let el = false

				var anchors = Array.from(document.querySelectorAll(".doctor_section_anchor"))

				for(let anchor of anchors)
				{
					let offset = anchor.offsetTop

					if(prev)
					{
						if(offset < scrollTop)
						{
							if(offset > max)
							{
								max = offset
								el = anchor
							}
						}
					}

					else
					{
						if(offset > scrollTop)
						{
							if(offset < max)
							{
								max = offset
								el = anchor
							}
						}
					}
				}

				if(check)
				{
					if(el)
					{
						return true
					}

					return false
				}

				else
				{
					if(!el)
					{
						if(prev)
						{
							doctor_go_to_top()
						}
					}

					else
					{
						doctor_scroll_to_element(el)
					}
				}
			}

			function doctor_scroll_to_element(el)
			{
				window.scrollTo(0, el.offsetTop)
			}

			function doctor_left_edge_click()
			{
				doctor_show_edge_menu()
			}

			function doctor_show_edge_menu()
			{
				doctor_edge_menu.style.left = "0"
				doctor_edge_menu_main.style.visibility = "visible"
				doctor_edge_menu_main.style.opacity = 1
				doctor_edge_menu_search_input.focus()

				doctor_edge_menu_open = true
			}

			function doctor_hide_edge_menu()
			{
				doctor_edge_menu.style.left = "-30rem"
				doctor_edge_menu_main.style.opacity = 0
				doctor_edge_menu_main.style.visibility = "hidden"
				doctor_reset_search()

				doctor_edge_menu_open = false
			}

			function doctor_show_modal(html)
			{
				doctor_modal_inner.innerHTML = html
				doctor_modal.style.display = "block"
				doctor_overlay.style.display = "block"
			}

			function doctor_hide_modal()
			{
				doctor_modal.style.display = "none"
				doctor_overlay.style.display = "none"
			}

			function doctor_show_feedback(id)
			{
				let section = document.getElementById(id)

				let feedback = section.querySelector(".doctor_section_feedback")

				let n = 0

				let interval = setInterval(function()
				{
					if(n % 2 === 0)
					{
						feedback.style.visibility = "visible"
					}

					else
					{
						feedback.style.visibility = "hidden"
					}

					n += 1

					// This should be an odd number
					if(n > 25)
					{
						clearInterval(interval)
						feedback.style.visibility = "hidden"
					}
				}, 100)
			}

		</script>
	`

	return script
}

function safe_parse_file_content(chars, s1, s2)
{
	s2 = `/${s2}`

	var s1b = `<${s1}>`
	var s2b = `<${s2}>`

	var len1 = s1b.length
	var len2 = s2b.length

	let i = 0

	var ncode = 0

	while(i < chars.length)
	{
		if(ncode === 0)
		{
			let index = chars.indexOf(s1b, i)

			if(index > -1)
			{
				i = index + len1
				ncode += 1
			}

			else
			{
				break
			}
		}

		else if(ncode > 0)
		{
			let index = chars.indexOf("<", i)
			let index2 = chars.indexOf(">", i)

			if(index > -1)
			{
				if(chars.slice(index, index + len1) === s1b)
				{
					chars = replace_string_at(chars, `&lt;${s1}&gt;`, index, index + len1)

					ncode += 1
					i = index + len1
					index2 = -1
				}

				else if(chars.slice(index, index + len2) === s2b)
				{
					if(ncode > 1)
					{
						chars = replace_string_at(chars, `&lt;${s2}&gt;`, index, index + len2)
					}

					ncode -= 1

					if(ncode < 0)
					{
						ncode = 0
					}

					i = index + len2
					index2 = -1
				}

				else
				{
					chars = replace_string_at(chars, "&lt;", index)
					i = index + 4
					index2 = chars.indexOf(">", i)
				}
			}

			if(index2 > -1)
			{
				if(index2 < index || ncode > 0)
				{
					chars = replace_string_at(chars, "&gt;", index2)
					i = Math.max(index2 + 4, i)
				}
			}

			if(index < 0 && index2 < 0)
			{
				break
			}
		}
	}

	return chars
}

function replace_string_at(s, c, i, i2=false)
{
	var ns1 = s.slice(0, i)
	
	var ns2

	if(i2)
	{
		ns2 = s.slice(i2, s.length)
	}

	else
	{
		ns2 = s.slice(i + 1, s.length)
	}

	return ns1 + c + ns2
}

function show_duration()
{
	var duration = Date.now() - time_start

	print_success(`Operation completed in ${duration} ms`)
}

function do_safe_parses(fc)
{
	fc = safe_parse_file_content(fc, "code", "code")
	fc = safe_parse_file_content(fc, "doc head", "doc")

	return fc
}

function print_error(s)
{
	console.info('\x1b[31m%s\x1b[0m', s);
}

function print_success(s)
{
	console.info('\x1b[36m%s\x1b[0m', s);
}

function show_intro()
{
	console.info(`Running Doctor ${doctor_version}`)
}

init()