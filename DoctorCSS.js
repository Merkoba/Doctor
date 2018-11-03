module.exports.generate = function(options)
{
	var image_cursor = "cursor: pointer;"

	if(!options.modal)
	{
		image_cursor = ""
	}

	var style = `
	<style>

			:root 
			{
				--fcolor: rgba(0, 0, 0, 0.9);
				--wcolor: rgba(255, 255, 255, 0.9);
				--tcolor: ${options.theme};
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

			#doctor_main_container
			{
				display: flex;
				flex-direction: column;
				flex-grow: 1;
				flex-shrink: 1;
				min-height: 100%;
				margin: 0 auto;
			}

			#doctor_main
			{
				flex-grow: 1;
				flex-shrink: 1;
				height: 100%;
				margin: 0 auto;
				padding: 0;
				margin-left: 2rem;
				margin-right: 2rem;
				margin-bottom: 4rem;
				background-color: white;
				color: var(--fcolor);
			}

			#doctor_footer
			{
				background-color: var(--tcolor);
				color: var(--wcolor);
				text-align: center;
				flex-grow: 0;
				flex-shrink: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 2rem;
			}

			#doctor_footer a 
			{
				color: var(--wcolor);
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

			a.section_header_anchor:visited, a.section_header_anchor:link, a.section_header_anchor:hover
			{
				color: inherit;
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

			.doctor_code_sample
			{
				margin: 0;
			} 

			.doctor_code_sample pre
			{
				margin: 0;
			}

			.doctor_code_sample code
			{
				font-style: italic;
			}

			.doctor_code_sample
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

			.doctor_section_header, #doctor_main_header
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
				height: 100%;
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
				padding-bottom: 0.5rem;
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
				${image_cursor}
			}

			.doctor_edge_menu_item_highlight
			{
				text-decoration: underline !important;
			}

			.doctor_pointer
			{
				cursor: pointer;
			}

		</style>
	`

	return style
}