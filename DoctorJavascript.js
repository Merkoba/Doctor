module.exports.generate = function(options)
{
	var keyboard_events = ""
	var menu_keyboard_escape_1 = ""
	var on_image_click = ""

	if(options.keyboard)
	{
		keyboard_events = `
			document.addEventListener("keyup", function(e)
			{
				if(e.key === "Escape")
				{
					if(!Doctor.edge_menu_open)
					{
						Doctor.show_edge_menu()
					}

					else
					{
						Doctor.reset_or_hide_menu()
					}

					e.preventDefault()
				}
			})
		`

		menu_keyboard_escape_1 = "return false;"
	}

	if(options.modal)
	{
		on_image_click = `
			else if(tag === "img")
			{
				Doctor.show_modal("<img src='" + el.src + "'>")
			}
		`
	}

	var script = `
		<script>

			const Doctor = {}

			Doctor.scroll_timer
			Doctor.check_scroll_delay = 100
			Doctor.search_delay = 200
			Doctor.edge_menu_item_selected = -1
			Doctor.edge_menu_items_filtered = []
			Doctor.edge_menu_open = false

			Doctor.main = document.getElementById("doctor_main")
			Doctor.bottom_button = document.getElementById("doctor_bottom_button")
			Doctor.next_button = document.getElementById("doctor_next_button")
			Doctor.top_menu = document.getElementById("doctor_top_menu")
			Doctor.modal = document.getElementById("doctor_modal")
			Doctor.modal_inner = document.getElementById("doctor_modal_inner")
			Doctor.overlay = document.getElementById("doctor_overlay")
			Doctor.edge_menu = document.getElementById("doctor_edge_menu")
			Doctor.edge_menu_main = document.getElementById("doctor_edge_menu_main")
			Doctor.edge_menu_content_inner = document.getElementById("doctor_edge_menu_content_inner")
			Doctor.edge_menu_search_input = document.getElementById("doctor_edge_menu_search_input")
			Doctor.edge_menu_items = Array.from(document.querySelectorAll(".doctor_edge_menu_item"))
			Doctor.section_anchors = Array.from(document.querySelectorAll(".doctor_section_anchor"))

			window.onload = function()
			{
				Doctor.scroll_timer = (function()
				{
					var timer

					return function()
					{
						clearTimeout(timer)

						timer = setTimeout(function()
						{
							Doctor.check_scroll()
						}, Doctor.check_scroll_delay)
					}
				})()

				Doctor.search_timer = (function()
				{
					var timer

					return function()
					{
						clearTimeout(timer)

						timer = setTimeout(function()
						{
							Doctor.search()
						}, Doctor.search_delay)
					}
				})()

				window.addEventListener("scroll", function(e)
				{
					Doctor.scroll_timer()
				})

				Doctor.edge_menu_items.forEach(function(el)
				{
					el.addEventListener("click", function()
					{
						Doctor.hide_edge_menu()
					})
				})

				Doctor.main.addEventListener("click", function(e)
				{
					var el = e.target

					var tag = el.tagName.toLowerCase()

					if(tag === "a")
					{
						if(el.classList.contains("doctor_section_anchor_link"))
						{
							Doctor.show_feedback(el.dataset.sectionId)
						}
					}

					${on_image_click}

					if(Doctor.edge_menu_open)
					{
						Doctor.hide_edge_menu()
					}
				})

				Doctor.edge_menu_content_inner.addEventListener("click", function(e)
				{
					var el = e.target

					var tag = el.tagName.toLowerCase()

					if(tag === "a")
					{
						if(el.classList.contains("doctor_section_anchor_link"))
						{
							Doctor.show_feedback(el.dataset.sectionId)
						}
					}
				})

				Doctor.top_menu.addEventListener("click", function(e)
				{
					if(Doctor.edge_menu_open)
					{
						Doctor.hide_edge_menu()
					}
				})

				Doctor.edge_menu_search_input.addEventListener("keyup", function(e)
				{
					Doctor.edge_menu_keyboard_handler(e)
				})				

				${keyboard_events}

				Doctor.check_scroll()
				Doctor.search(false)
			}

			Doctor.reset_or_hide_menu = function()
			{
				if(Doctor.edge_menu_search_input.value.trim())
				{
					Doctor.reset_search()
				}

				else
				{
					Doctor.hide_edge_menu()
				}
			}

			Doctor.edge_menu_keyboard_handler = function(e)
			{
				if(e.key === "Escape")
				{
					${menu_keyboard_escape_1}
					Doctor.reset_or_hide_menu()
					e.preventDefault()
				}

				else if(e.key === "Enter")
				{
					Doctor.go_to_selected_menu_item()
					e.preventDefault()
				}

				else if(e.key === "ArrowUp")
				{
					Doctor.menu_item_up()
					e.preventDefault()
				}

				else if(e.key === "ArrowDown")
				{
					Doctor.menu_item_down()
					e.preventDefault()
				}

				else
				{
					Doctor.search_timer()
				}
			}

			Doctor.menu_item_up = function()
			{
				if(Doctor.edge_menu_item_selected <= 0)
				{
					return false
				}

				Doctor.edge_menu_clear_selected()

				let i = Doctor.edge_menu_items_filtered.length - 1

				for(let item of Doctor.edge_menu_items_filtered.slice().reverse())
				{
					if(i < Doctor.edge_menu_item_selected)
					{
						item.classList.add("doctor_edge_menu_item_highlight")
						Doctor.edge_menu_item_selected = i
						return
					}

					i -= 1
				}
			}

			Doctor.menu_item_down = function()
			{
				if(Doctor.edge_menu_item_selected >= Doctor.edge_menu_items_filtered.length - 1)
				{
					return false
				}

				Doctor.edge_menu_clear_selected()

				let i = 0

				for(let item of Doctor.edge_menu_items_filtered)
				{
					if(i > Doctor.edge_menu_item_selected)
					{
						item.classList.add("doctor_edge_menu_item_highlight")
						Doctor.edge_menu_item_selected = i
						return
					}

					i += 1
				}
			}

			Doctor.edge_menu_clear_selected = function()
			{
				for(let item of Doctor.edge_menu_items_filtered)
				{
					item.classList.remove("doctor_edge_menu_item_highlight")
				}
			}

			Doctor.go_to_selected_menu_item = function()
			{
				if(Doctor.edge_menu_item_selected < 0)
				{
					return false
				}

				let item = Doctor.edge_menu_items_filtered[Doctor.edge_menu_item_selected]
				let section_id = item.dataset.sectionId
				let section = document.getElementById(section_id)
				let anchor = section.querySelector(".doctor_section_anchor")
				Doctor.scroll_to_element(anchor)
				Doctor.show_feedback(section_id)
				Doctor.hide_edge_menu()
			}

			Doctor.reset_search = function()
			{
				Doctor.edge_menu_search_input.value = ""
				Doctor.search(false)
				Doctor.edge_menu_item_selected = -1
			}

			Doctor.search = function(highlight=true)
			{
				var lst = []

				var input = Doctor.edge_menu_search_input.value.toLowerCase().trim()

				for(let item of Doctor.edge_menu_items)
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

				Doctor.edge_menu_items_filtered = lst
				Doctor.edge_menu_clear_selected()

				if(highlight && Doctor.edge_menu_items_filtered.length > 0)
				{
					Doctor.edge_menu_item_selected = 0
					Doctor.edge_menu_items_filtered[Doctor.edge_menu_item_selected].classList.add("doctor_edge_menu_item_highlight")
				}
			}

			Doctor.get_scrollTop = function()
			{
				return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
			}

			Doctor.get_scrollHeight = function()
			{
				return document.documentElement.scrollHeight || document.body.scrollHeight || 0
			}

			Doctor.get_clientHeight = function()
			{
				return document.documentElement.clientHeight || document.body.clientHeight || 0
			}

			Doctor.check_scroll = function()
			{	
				var scrollTop = Math.round(Doctor.get_scrollTop())

				if(scrollTop > 0)
				{
					Doctor.show_top_menu()

					var scrollHeight = Math.round(Doctor.get_scrollHeight())
					var clientHeight = Math.round(Doctor.get_clientHeight())

					let d = scrollHeight - scrollTop

					//This is used to create a range to avoid split pixel miscalculations
					let diff = 4

					if(d - diff < clientHeight || clientHeight + diff > d)
					{
						Doctor.bottom_button.style.opacity = 0.5
						Doctor.next_button.style.opacity = 0.5
					}

					else
					{
						Doctor.bottom_button.style.opacity = 1

						if(Doctor.go_to_anchor(false, true))
						{
							Doctor.next_button.style.opacity = 1
						}

						else
						{
							Doctor.next_button.style.opacity = 0.5
						}
					}
				}

				else
				{
					Doctor.hide_top_menu()
				}
			}

			Doctor.show_top_menu = function()
			{
				Doctor.top_menu.style.opacity = "1"
				Doctor.top_menu.style.pointerEvents = "initial"
			}

			Doctor.hide_top_menu = function()
			{
				Doctor.top_menu.style.opacity = "0"
				Doctor.top_menu.style.pointerEvents = "none"
			}

			Doctor.go_to_top = function()
			{
				Doctor.hide_top_menu()

				window.scrollTo({
					top: 0,
					behavior: "smooth"
				});
			}

			Doctor.go_to_bottom = function()
			{
				Doctor.bottom_button.style.opacity = 0.5
				Doctor.next_button.style.opacity = 0.5

				window.scrollTo({
					top: Doctor.main.clientHeight,
					behavior: "smooth"
				});
			}

			Doctor.go_to_anchor = function(prev=true, check=false)
			{
				let scrollTop = Doctor.get_scrollTop()

				let max = 0

				if(!prev)
				{
					max = Doctor.main.clientHeight
				}

				let el = false

				for(let anchor of Doctor.section_anchors)
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
							Doctor.go_to_top()
						}
					}

					else
					{
						Doctor.scroll_to_element(el)
					}
				}
			}

			Doctor.scroll_to_element = function(el)
			{
				window.scrollTo(0, el.offsetTop)
			}

			Doctor.left_edge_click = function()
			{
				Doctor.show_edge_menu()
			}

			Doctor.show_edge_menu = function()
			{
				Doctor.edge_menu.style.left = "0"
				Doctor.edge_menu_main.style.visibility = "visible"
				Doctor.edge_menu_main.style.opacity = 1
				Doctor.edge_menu_search_input.focus()

				Doctor.edge_menu_open = true
			}

			Doctor.hide_edge_menu = function()
			{
				Doctor.edge_menu.style.left = "-30rem"
				Doctor.edge_menu_main.style.opacity = 0
				Doctor.edge_menu_main.style.visibility = "hidden"
				Doctor.reset_search()

				Doctor.edge_menu_open = false
			}

			Doctor.show_modal = function(html)
			{
				Doctor.modal_inner.innerHTML = html
				Doctor.modal.style.display = "block"
				Doctor.overlay.style.display = "block"
			}

			Doctor.hide_modal = function()
			{
				Doctor.modal.style.display = "none"
				Doctor.overlay.style.display = "none"
			}

			Doctor.show_feedback = function(id)
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