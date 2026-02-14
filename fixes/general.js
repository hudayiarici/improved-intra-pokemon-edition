/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   general.js                                         :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/03/28 18:52:19 by fbes          #+#    #+#                 */
/*   Updated: 2025/07/18 18:45:14 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function createMenuLink(userMenu, href, text, position) {
	const menuLink = document.createElement("a");
	menuLink.setAttribute("href", href);
	menuLink.setAttribute("target", "_self");
	menuLink.innerText = text;
	const menuItem = document.createElement("li");
	menuItem.appendChild(menuLink);
	if (position && typeof position == "object") {
		userMenu.insertBefore(menuItem, position);
	}
	else if (position == "bottom") {
		userMenu.appendChild(menuItem);
	}
	else {
		userMenu.insertBefore(menuItem, userMenu.children[0]);
	}
}

const pokemonList = ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina", "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetch'd", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"];

function getPokemonForUser(login, actualLevel = null) {
	let hash = 0;
	for (let i = 0; i < login.length; i++) {
		hash = login.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % pokemonList.length;
	const level = actualLevel || (Math.abs(hash) % 30) + 1;
	return { name: pokemonList[index], level: level };
}

const levelCache = {};

function getPokemonForUser(login) {
	let hash = 0;
	for (let i = 0; i < login.length; i++) {
		hash = login.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % pokemonList.length;
	return { name: pokemonList[index], id: index + 1 };
}

function applyPokemonNames() {
	try {
		// 1. Broad titles replacement
		const allTitles = document.querySelectorAll("h1, h2, h3, h4, h5, .profile-title, .title");
		allTitles.forEach(el => {
			const txt = el.textContent;
			if (txt.includes("Patroning")) {
				el.textContent = txt.replace("Patroning", "MY POKEMONS");
			} else if (txt.includes("Patroned by")) {
				el.textContent = txt.replace("Patroned by", "MY TRAINER");
			}
		});

		// 2. Assign Pokemon (Links + Login spans)
		const targets = document.querySelectorAll("a[href*='/users/'], .login");
		targets.forEach(el => {
			if (el.querySelector(".pokemon-container") || el.closest(".user-level")) return;

			let login = "";
			if (el.tagName === "A") {
				const href = el.getAttribute("href");
				const match = href.match(/\/users\/([a-z0-9\-_]+)$/i);
				if (match) login = match[1];
			} else {
				login = el.textContent.trim().split(/\s+/)[0];
			}

			if (!login || login === "sign_in" || login.length < 3) return;

			const isMainProfile = window.location.pathname.includes("/users/" + login) || (el.classList.contains("login") && !el.closest(".patronage-item"));
			const isPatronage = el.closest(".patronage-item") || el.closest(".user-primary") || el.closest(".user-infos");

			if (isMainProfile || isPatronage) {
				const pokeData = getPokemonForUser(login);
				const container = document.createElement("span");
				container.className = "pokemon-container";
				
				const img = document.createElement("img");
				img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeData.id}.png`;
				img.className = "pokemon-sprite";
				
				const nameSpan = document.createElement("span");
				nameSpan.className = "pokemon-name";
				
				if (isMainProfile && !isPatronage) {
					nameSpan.style.cssText = "font-size: 0.75em; margin-left: 5px; color: #ff1f1f; font-weight: bold;";
					nameSpan.innerText = "(" + pokeData.name + ")";
					container.appendChild(img);
					container.appendChild(nameSpan);
				} else {
					nameSpan.style.cssText = "font-size: 0.8em; display: block; margin-top: -5px; color: #ff1f1f; font-weight: bold;";
					nameSpan.innerText = pokeData.name;
					container.appendChild(img);
					container.appendChild(nameSpan);
				}
				el.appendChild(container);
			}
		});
	} catch (e) {}
}

function setGeneralImprovements() {
	if (isIntraV3) {
		return;
	}

	// Pokemon Logic
	applyPokemonNames();
	const pokeObserver = new MutationObserver(applyPokemonNames);
	pokeObserver.observe(document.body, { childList: true, subtree: true });

	// fix things on profile banners
	if (hasProfileBanner()) {
		fixProfileBanners();
	}

	const userMenu = document.querySelector(".main-navbar-user-nav ul[role='menu']");
	if (userMenu) {
		createMenuLink(userMenu, "https://iintra.freekb.es/v2/options", "Improved Intra Settings", userMenu.lastElementChild);
		if (!userMenu.querySelector("a[href*='https://profile.intra.42.fr/users/']")) {
			createMenuLink(userMenu, "https://profile.intra.42.fr/users/me", "View my profile");
		}
		if (!userMenu.querySelector("a[href='https://profile.intra.42.fr/slots']")) {
			createMenuLink(userMenu, "https://profile.intra.42.fr/slots", "Manage slots");
		}
	}

	const sidebarPatronagesLink = document.querySelector("a[href='/patronages'] .sidebar-item-text");
	if (sidebarPatronagesLink) {
		sidebarPatronagesLink.innerText = "Pokemons";
	}

	const problemButtonWrapper = document.querySelector(".main-navbar-user-nav > .help-btn-wrapper");
	if (problemButtonWrapper) {
		const problemButton = problemButtonWrapper.querySelector(".btn-danger");
		const problemButtonLink = problemButton ? problemButton.querySelector("a") : null;
		if (problemButtonLink) {
			const newProblemButton = document.createElement("a");
			newProblemButton.setAttribute("href", problemButtonLink.getAttribute("href"));
			newProblemButton.setAttribute("target", "_blank");
			newProblemButton.classList.add("btn", "btn-danger", "text-white", "help-btn");
			newProblemButton.innerText = "Have a problem?";
			problemButtonWrapper.replaceChild(newProblemButton, problemButton);
		}
	}

	const ltSvg = document.getElementById("user-locations");
	if (ltSvg) {
		colorizeNewLogTimeDays();
		ltSvg.addEventListener("load", colorizeNewLogTimeDays);
	}

	const achievementItemContents = document.getElementsByClassName("achievement-item--content");
	for (let i = 0; i < achievementItemContents.length; i++) {
		const achName = achievementItemContents[i].querySelector("h1");
		if (achName) {
			achName.setAttribute("title", achName.textContent.replaceAll("\n", ""));
		}
		const achDesc = achievementItemContents[i].querySelector("p");
		if (achDesc) {
			achDesc.setAttribute("title", achDesc.textContent);
		}
	}

	const eventLefts = document.getElementsByClassName("event-left");
	for (let i = 0; i < eventLefts.length; i++) {
		const dateElem = eventLefts[i].querySelector(".date-day");
		const monthElem = eventLefts[i].querySelector(".date-month");
		if (dateElem && monthElem) {
			const date = dateElem.textContent;
			const month = monthElem.textContent;
			let jsDate = new Date(date + " " + month + " " + today.getFullYear());
			if (jsDate.getMonth() < today.getMonth()) {
				jsDate = new Date(date + " " + month + " " + (today.getFullYear() + 1));
			}
			const dayNameElem = document.createElement("div");
			dayNameElem.className = "date-day-name";
			dayNameElem.innerText = jsDate.toLocaleString("en", {weekday: 'short'});
			eventLefts[i].insertBefore(dayNameElem, eventLefts[i].firstElementChild);
		}
	}

	const eventsList = document.getElementById("events-list");
	if (eventsList) {
		const agendaContainer = eventsList.closest(".container-inner-item.boxed");
		if (agendaContainer) {
			agendaContainer.classList.add("agenda-container");
			const syncButton = document.createElement("a");
			syncButton.className = "btn simple-link";
			syncButton.href = "https://iintra.freekb.es/v2/options/calendar";
			syncButton.innerText = "Set up sync";
			const pullRight = agendaContainer.querySelector(".pull-right");
			if (pullRight) {
				pullRight.insertBefore(syncButton, pullRight.lastElementChild);
			}
		}
	}

	if (!window.location.pathname.startsWith("/projects/graph")) {
		const sidebarMenu = document.querySelector(".app-sidebar-left");
		const leftSidebarFix = document.querySelector(".left-sidebar-fix");
		const pageContent = document.querySelector(".page-content");
		if (sidebarMenu) {
			const hideButton = document.createElement("button");
			hideButton.className = "sidebar-hide-button emote icon-arrow-37";
			hideButton.setAttribute("title", "Hide sidebar");
			hideButton.addEventListener("click", function(ev) {
				sidebarMenu.classList.toggle("app-sidebar-hidden");
				if (leftSidebarFix) {
					leftSidebarFix.classList.toggle("sidebar-fix-hidden");
				}
				if (pageContent) {
					pageContent.classList.toggle("page-content-fluid");
				}
				ev.currentTarget.classList.toggle("icon-arrow-38");
				ev.currentTarget.classList.toggle("icon-arrow-37");
				ev.currentTarget.blur();
			});
			sidebarMenu.insertBefore(hideButton, sidebarMenu.firstChild);
		}
	}
}

function setEasterEgg() {
	const elements = document.querySelectorAll("*");
	for (let i = 0; i < elements.length; i++) {
		elements[i].className += " funnyhaha";
		elements[i].style.animationDuration = randomIntFromInterval(0.1, 10) + "s";
		elements[i].style.animationDelay = randomIntFromInterval(0, 10) + "s";
	}
}

function setPageProjectsUsersImprovements(match) {
	[...document.querySelectorAll('.correction-comment-item, .feedback-item')].forEach(item => {
		item.childNodes.forEach(childNode => {
			if (childNode.nodeType !== 3 || childNode.textContent.trim().length === 0) {
				return;
			}
			const span = document.createElement('span');
			span.innerText = childNode.textContent.trim();
			childNode.parentNode.insertBefore(span, childNode);
			childNode.parentNode.removeChild(childNode);
		});
	});
}

function setPageUserFeedbacksImprovements(match) {
	[...document.querySelectorAll('li.scaleteam-list-item .comment')].forEach(item => {
		item.innerText = item.textContent.trim();
	});
}

function setInternshipAdministrationImprovements(match) {
	const administrationSelectBox = document.getElementById("administrations_user_user_id");
	if (administrationSelectBox) {
		const administrationSelectBoxOptions = administrationSelectBox.querySelectorAll("option");
		const administrationSelectBoxOptionsArray = Array.from(administrationSelectBoxOptions);
		administrationSelectBoxOptionsArray.sort((a, b) => {
			return a.text.localeCompare(b.text);
		});
		administrationSelectBoxOptionsArray.forEach(option => {
			administrationSelectBox.appendChild(option);
		});
	}
}

function setPageSlotsImprovements(match) {
	const calendar = document.getElementById("calendar");
	if (calendar) {
		function dayHeaderToLocalFormat(fcDayHeader) {
			const dataDate = fcDayHeader.getAttribute("data-date");
			const date = new Date(dataDate);
			const dayOfWeek = dayToString(date.getDay()).substring(0, 3);
			fcDayHeader.innerText = dayOfWeek + " " + date.toLocaleDateString([], {
				day: "2-digit",
				month: "2-digit",
			});
		}
		const fcDayHeaders = calendar.querySelectorAll(".fc-day-header");
		for (const fcDayHeader of fcDayHeaders) {
			dayHeaderToLocalFormat(fcDayHeader);
		}
		function firstColumnTimeToLocalFormat(timeRow) {
			const dataTime = timeRow.getAttribute("data-time");
			const date = new Date("2023-01-01T" + dataTime);
			const timeSpan = timeRow.querySelector(".fc-time span");
			if (timeSpan) {
				timeSpan.innerText = date.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
			}
		}
		const fcSlats = calendar.querySelector(".fc-slats");
		if (fcSlats) {
			const timeRows = fcSlats.querySelectorAll("tr[data-time]:not(.fc-minor)");
			for (const timeRow of timeRows) {
				firstColumnTimeToLocalFormat(timeRow);
			}
		}
		function slotTimeToLocalFormat(slot) {
			const fcTime = slot.querySelector(".fc-time");
			if (fcTime) {
				const dataFull = fcTime.getAttribute("data-full");
				const timeStart = dataFull.split(" - ")[0];
				const timeEnd = dataFull.split(" - ")[1];
				const dateStart = new Date("2023-01-01 " + timeStart);
				const dateEnd = new Date("2023-01-01 " + timeEnd);
				const timespanSpan = fcTime.querySelector("span:first-child");
				if (timespanSpan) {
					timespanSpan.innerText = dateStart.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					}) + " - " + dateEnd.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					});
				}
			}
		}
		const observer = new MutationObserver(function(mutations) {
			for (const mutation of mutations) {
				if (mutation.type !== "childList") continue;
				for (const node of mutation.addedNodes) {
					if (node.nodeType !== Node.ELEMENT_NODE) continue;
					if (node.classList.contains("fc-time-grid-event")) {
						slotTimeToLocalFormat(node);
					}
					else if (node.classList.contains("fc-day-header")) {
						dayHeaderToLocalFormat(node);
					}
					else if (node.classList.contains("fc-slats")) {
						const timeRows = node.querySelectorAll("tr[data-time]:not(.fc-minor)");
						for (const timeRow of timeRows) {
							firstColumnTimeToLocalFormat(timeRow);
						}
					}
				}
			}
		});
		observer.observe(calendar, { childList: true, subtree: true });
	}
}

async function setPageEvaluationsImprovements(match) {
	const collapseEvaluations = document.getElementById("collapseEvaluations");
	if (!collapseEvaluations) return;
	const evaluations = collapseEvaluations.querySelectorAll(".project-item");
	for (const evaluation of evaluations) {
		if (evaluation.innerText.includes("left to feedback")) continue;
		const projectItemText = evaluation.querySelector(".project-item-text");
		if (!projectItemText) continue;
		const textNodes = Array.from(projectItemText.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
		if (textNodes.length === 0) continue;
		const lastTextNode = textNodes[textNodes.length - 1];
		const projectMatch = lastTextNode.textContent.match(/(\s+.+)?on (.+)/);
		if (!projectMatch) continue;
		const projectName = projectMatch[2].trim();
		let projectSlug = projectName.replace(/ - /g, "-").replace(/ /g, "-").toLowerCase();
		if (!(await urlExists(`https://projects.intra.42.fr/projects/${projectSlug}`))) {
			projectSlug = `42cursus-${projectSlug}`;
		}
		const projectLink = document.createElement("a");
		projectLink.href = `https://projects.intra.42.fr/projects/${projectSlug}`;
		projectLink.textContent = projectName;
		projectLink.className = "project-item-link";
		projectItemText.insertBefore(projectLink, lastTextNode);
		lastTextNode.remove();
		projectItemText.insertBefore(document.createTextNode((projectMatch[1]? projectMatch[1] : "") + " on "), projectLink);
	}
}

function setEarlyAccessImprovements(match) {
	const earlyAccessContainer = document.getElementById("profile-v3-early-access-container");
	if (earlyAccessContainer) {
		const earlyAccessNote = document.createElement("p");
		earlyAccessNote.className = "alert alert-warning";
		earlyAccessNote.style.marginTop = "6rem";
		earlyAccessNote.style.fontWeight = "bold";
		earlyAccessNote.style.whiteSpace = "pre-wrap";
		earlyAccessNote.innerText = "Improved Intra is not compatible with Intra v3...";
		earlyAccessContainer.appendChild(earlyAccessNote);
	}
}

function setPageUserImprovements(match) {
	if (isIntraV3) return;
	
	// Ensure Pokemon names are applied here as well
	applyPokemonNames();

	const projectItemsContainer = document.querySelector("#marks .overflowable-item");
	if (projectItemsContainer) {
		const mainProjectItems = Array.from(projectItemsContainer.querySelectorAll(".main-project-item:not(.parent-item)"));
		const mainProjectItemCollapsables = Array.from(projectItemsContainer.querySelectorAll(".collapsable"));
		improvedStorage.get("sort-projects-date").then(function(data) {
			const completionDateSorterDesc = (a, b) => (Date.parse(b.querySelector(".project-item-lighteable").dataset.longDate) - Date.parse(a.querySelector(".project-item-lighteable").dataset.longDate));
			const completionDateSorterAsc = (a, b) => (Date.parse(a.querySelector(".project-item-lighteable").dataset.longDate) - Date.parse(b.querySelector(".project-item-lighteable").dataset.longDate));
			const alphabeticalSorterAsc = (a, b) => a.querySelector(".marked-title").textContent.localeCompare(b.querySelector(".marked-title").textContent);
			const sortProjectsDate = optionIsActive(data, "sort-projects-date");
			mainProjectItems.sort((sortProjectsDate ? completionDateSorterDesc : alphabeticalSorterAsc));
			mainProjectItems.forEach(item => projectItemsContainer.appendChild(item));
			mainProjectItemCollapsables.sort(completionDateSorterAsc);
			mainProjectItemCollapsables.forEach(collapsable => {
				const collapsableProjectItem = collapsable.querySelector(".project-item");
				const mainProjectItem = projectItemsContainer.querySelector(`.project-item[data-project="${collapsableProjectItem.id}"][data-cursus="${collapsableProjectItem.dataset.cursus}"]`);
				if (mainProjectItem) mainProjectItem.parentNode.insertBefore(collapsable, mainProjectItem.nextElementSibling);
			});
			const parentProjectItems = Array.from(projectItemsContainer.querySelectorAll(".main-project-item.parent-item"));
			parentProjectItems.reverse();
			parentProjectItems.forEach(parentProjectItem => {
				projectItemsContainer.insertBefore(parentProjectItem, projectItemsContainer.firstChild);
				const parentProjectItemCollapsables = Array.from(projectItemsContainer.querySelectorAll(parentProjectItem.dataset.target));
				parentProjectItemCollapsables.forEach(collapsable => projectItemsContainer.insertBefore(collapsable, projectItemsContainer.firstChild.nextSibling));
			});
		});
	}
}