#! /usr/bin/env node

const pkg = require("./package.json")

const doctor_version = pkg.version
const doctor_site_url = pkg.homepage

const DoctorJavascript = require("./DoctorJavascript")
const DoctorCSS = require("./DoctorCSS")

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

	let file_content

	try
	{
		file_content = fs.readFileSync(file_path, "utf-8")
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

	get_elements(file_content)

	create_file(generate_html())

	show_duration()
}

function get_elements(fcontent)
{
	const $ = cheerio.load(fcontent)

	$("xcodex").each(function()
	{
		if($(this).parents("xcodex").length > 0)
		{	
			return true
		}

		$(this).html($(this).html().replace(/</g, "&lt;").replace(/>/g, "&gt;"))

		let h = dummy_space(fix_code_sample($(this).html()))

		let ns = `<blockquote class='doctor_code_sample'><pre><code>${h}</code></pre></blockquote>`
		
		$(this).replaceWith(ns)
	})

	const elements = $("doc")

	elements.each(function()
	{
		let type = Object.keys($(this).attr())[0]

		let content

		if(type === "description" || type === "section")
		{
			content = $(this).html().trim()
			content = clean_string2(replace_linebreaks(content))
		}

		else
		{
			content = $(this).text().trim()
		}

		content = dummy_space(content, false)

		if(!type || !content)
		{
			return true
		}

		let attributes = $(this).attr()

		objects.push({type:type, content:content, attributes:attributes})
	})
}

function generate_html()
{
	let header = ""
	let description = ""
	let style = ""
	let script = ""
	let head = ""
	let title = ""
	let theme = "#757593"
	let sections = []
	let sections_menu_html = ""
	let sections_html = ""
	let edge_sections_menu = ""
	let favicon = ""
	let keyboard = true
	let modal = true
	let footer = ""

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

		else if(obj.type === "modal")
		{
			modal = JSON.parse(obj.content)
		}

		else if(obj.type === "footer")
		{
			footer = obj.content
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

	let footer_html = ""

	if(footer)
	{
		footer_html = `<div id='doctor_footer'>${footer}</div>`
	}

	let s = `
	<!doctype html>

	<!-- Code generated by Doctor ${doctor_version} -->
	<!-- ${doctor_site_url} -->

	<html>

	<head>

		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>${title}</title>
		<link rel='shortcut icon' href='${favicon}' type='image/x-icon'>

		${DoctorCSS.generate({theme:theme, modal:modal})}

		<style>
			${style}
		</style>

		${head}

	</head>

	<body>

		<div id='doctor_rows'>

			<div id='doctor_top_menu' class='doctor_unselectable'>
				<div id='doctor_prev_button' class='doctor_action' onclick='Doctor.go_to_anchor()'>Prev</div>
				<div id='doctor_top_button' class='doctor_action' onclick='Doctor.go_to_top()'>Top</div>
				<div id='doctor_bottom_button' class='doctor_action' onclick='Doctor.go_to_bottom()'>Bottom</div>
				<div id='doctor_next_button' class='doctor_action' onclick='Doctor.go_to_anchor(false)'>Next</div>
			</div>

			<div id='doctor_left_edge' onclick='Doctor.left_edge_click()'></div>

			<div id='doctor_overlay' onclick='Doctor.hide_modal()'></div>

			<div id='doctor_modal' onclick='Doctor.hide_modal()'>
				<div id='doctor_modal_inner'></div>
			</div>

			<div id='doctor_edge_menu'>
				<div id='doctor_edge_menu_main' class='doctor_unselectable'>
					<div id='doctor_edge_menu_columns'>
						<div id='doctor_edge_menu_close_container'>
							<div id='doctor_edge_menu_close' class='doctor_action' onclick='Doctor.hide_edge_menu()'>Close</div>
						</div>
						<div id='doctor_edge_menu_content'>
							<div id='doctor_edge_menu_content_inner'>
								<h2 id='doctor_edge_menu_header' class='doctor_action' onclick="Doctor.go_to_top();doctor_hide_edge_menu()">${header}</h2>
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

			<div id='doctor_main_container'>

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
				</div>
				
				${footer_html}

			</div>

		</div>

		${DoctorJavascript.generate({keyboard:keyboard, modal:modal})}

		<script>${script}</script>

	</body>

	</html>
	`

	return s
}

function create_file(html)
{
	let file_name

	if(output_path)
	{
		file_name = output_path
	}

	else
	{
		file_name = `${path.dirname(file_path)}/index.html`
	}

	let stream = fs.createWriteStream(file_name)

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

		let rep = new RegExp(`^${ts}`, "g")

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

function safe_parse_file_content(chars, s1, s2)
{
	s2 = `/${s2}`

	let s1b = `<${s1}>`
	let s2b = `<${s2}>`

	let len1 = s1b.length
	let len2 = s2b.length

	let i = 0

	let ncode = 0

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
	let ns1 = s.slice(0, i)
	
	let ns2

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
	let duration = Date.now() - time_start

	print_success(`Operation completed in ${duration} ms`)
}

function do_safe_parses(fc)
{
	fc = safe_parse_file_content(fc, "xcodex", "xcodex")
	fc = safe_parse_file_content(fc, "doc head", "doc")
	fc = safe_parse_file_content(fc, "doc footer", "doc")

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