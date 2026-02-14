/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   general.js                                         :+:    :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: harici <harici@student.42istanbul.com.tr   +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/03/28 18:52:19 by fbes              #+#    #+#             */
/*   Updated: 2026/02/14 16:00:00 by harici           ###   ########.fr       */
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

let pokemonList = [];
let isPokemonListLoading = false;

async function fetchAllPokemonNames() {
	if (pokemonList.length > 0) return pokemonList;
	if (isPokemonListLoading) return new Promise(resolve => {
		const interval = setInterval(() => {
			if (!isPokemonListLoading) {
				clearInterval(interval);
				resolve(pokemonList);
			}
		}, 100);
	});

	isPokemonListLoading = true;
	try {
		const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
		const data = await response.json();
		pokemonList = data.results.map(p => {
			return {
				name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
				id: p.url.split("/").filter(Boolean).pop()
			};
		});
		iConsole.log(`Loaded ${pokemonList.length} Pokemon from PokeAPI`);
	} catch (err) {
		iConsole.error("Could not fetch Pokemon list", err);
		pokemonList = [
			{ name: "Bulbasaur", id: 1 },
			{ name: "Charmander", id: 4 },
			{ name: "Squirtle", id: 7 },
			{ name: "Pikachu", id: 25 }
		];
	}
	isPokemonListLoading = false;
	return pokemonList;
}

function getPokeDataForUser(login, isTrainer = false) {
	let hash = 0;
	for (let i = 0; i < login.length; i++) {
		hash = login.charCodeAt(i) + ((hash << 5) - hash);
	}
	if (isTrainer) {
		const index = Math.abs(hash) % trainerList.length;
		return { ...trainerList[index], type: "trainer" };
	} else {
		const listToUse = pokemonList.length > 0 ? pokemonList : [
			{ name: "Bulbasaur", id: 1 },
			{ name: "Charmander", id: 4 },
			{ name: "Squirtle", id: 7 },
			{ name: "Pikachu", id: 25 }
		];
		const index = Math.abs(hash) % listToUse.length;
		return { ...listToUse[index], type: "pokemon" };
	}
}

// Supabase Configuration
const SUPABASE_URL = 'https://zaxlzvhmflmihyzbvxei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpheGx6dmhtZmxtaWh5emJ2eGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMzYzNzgsImV4cCI6MjA4NjYxMjM3OH0.Haf84dYUuu-j69MZR9cR1YRjQ6czOJO25JjbjMyE0GY';

// Shared cache for custom pokemon choices
let customPokeCache = null;
let isCacheLoading = false;

async function fetchGlobalPokemon() {
	try {
		const response = await fetch(`${SUPABASE_URL}/rest/v1/pokemon_mappings?select=username,pokemon_name`, {
			method: 'GET',
			headers: {
				'apikey': SUPABASE_ANON_KEY,
				'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
			}
		});
		const data = await response.json();
		const mappings = {};
		data.forEach(item => {
			mappings[item.username.toLowerCase()] = item.pokemon_name;
		});
		return mappings;
	} catch (err) {
		iConsole.warn("Could not fetch global Pokemon from Supabase", err);
		return null;
	}
}

async function updateGlobalPokemon(username, pokemonName) {
	try {
		await fetch(`${SUPABASE_URL}/rest/v1/pokemon_mappings`, {
			method: 'POST',
			headers: {
				'apikey': SUPABASE_ANON_KEY,
				'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
				'Content-Type': 'application/json',
				'Prefer': 'resolution=merge-duplicates'
			},
			body: JSON.stringify({
				username: username.toLowerCase(),
				pokemon_name: pokemonName,
				updated_at: new Date().toISOString()
			})
		});
		iConsole.log(`Updated global Pokemon for ${username}: ${pokemonName}`);
	} catch (err) {
		iConsole.error("Could not update global Pokemon", err);
	}
}

const trainerList = [
	{ name: "Ash (Red)", id: 1 },
	{ name: "Gary (Blue)", id: 2 },
	{ name: "Brock", id: 48 },
	{ name: "Misty", id: 49 },
	{ name: "Lt. Surge", id: 18 },
	{ name: "Erika", id: 20 },
	{ name: "Sabrina", id: 24 },
	{ name: "Blaine", id: 26 },
	{ name: "Giovanni", id: 28 },
	{ name: "Professor Oak", id: 33 }
];

async function applyPokemonNames() {
	try {
		// Ensure we have all pokemon names loaded
		await fetchAllPokemonNames();

		// Pre-load custom pokemon from Supabase first, then fallback to local
		if (customPokeCache === null) {
			if (isCacheLoading) return;
			isCacheLoading = true;
			
			// 1. Try Supabase
			const globalData = await fetchGlobalPokemon();
			if (globalData) {
				customPokeCache = globalData;
			} else {
				// 2. Fallback to local storage
				const localData = await improvedStorage.get("custom-pokemon");
				customPokeCache = localData["custom-pokemon"] || {};
			}
			isCacheLoading = false;
		}

		// 1. Broad titles and empty states replacement
		const allTextElems = document.querySelectorAll("h1, h2, h3, h4, h5, .profile-title, .title, p, span, div");
		allTextElems.forEach(el => {
			if (el.children.length > 0) return; // Only target elements with direct text to avoid breaking structure
			const txt = el.textContent;
			if (txt.includes("Patroning") && (el.tagName.startsWith("H") || el.classList.contains("profile-title"))) {
				el.textContent = txt.replace("Patroning", "Pokemons");
			} else if (txt.includes("Patroned by") && (el.tagName.startsWith("H") || el.classList.contains("profile-title"))) {
				el.textContent = txt.replace("Patroned by", "Trainer");
			} else if (txt.toLowerCase().includes("not patroning anyone")) {
				el.textContent = "Not training any Pokemon";
			} else if (txt.toLowerCase().includes("no patron")) {
				el.textContent = "No trainer";
			}
		});

		// 2. Assign Pokemon (Links + Login spans)
		const targets = document.querySelectorAll("a[href*='/users/'], .login, [data-search-item], .tt-suggestion");
		targets.forEach(el => {
			if (el.querySelector(".pokemon-container")) return;

			let login = el.getAttribute("data-login") || el.getAttribute("data-search-item") || "";
			if (!login) {
				if (el.tagName === "A") {
					const href = el.getAttribute("href");
					const match = href.match(/\/users\/([a-z0-9\-_]+)$/i);
					if (match) login = match[1];
				} else {
					// Specific fix for search bar suggestions which might have login in specific child
					const loginSub = el.querySelector(".login, .login-name, em");
					if (loginSub) {
						login = loginSub.textContent.trim();
					} else {
						login = el.textContent.trim().split(/\s+/)[0];
					}
				}
			}

			if (!login || login === "sign_in" || login.length < 3) return;
			login = login.toLowerCase().trim();

			const isOwnDashboard = window.location.hostname === "profile.intra.42.fr" && window.location.pathname === "/";
			const isMainProfile = (window.location.pathname.includes("/users/" + login) || isOwnDashboard) && !el.closest(".patronage-item");
			
			// Absolute Trainer Detection: Scan between titles
			let isTrainerSection = false;
			const allTitles = document.querySelectorAll("h4, .profile-title");
			for (const title of allTitles) {
				if (title.textContent.includes("Trainer") || title.textContent.includes("Patroned by")) {
					// Check all following siblings until the next heading
					let sibling = title.nextElementSibling;
					while (sibling && sibling.tagName !== "H4" && !sibling.classList.contains("profile-title")) {
						if (sibling.contains(el)) {
							isTrainerSection = true;
							break;
						}
						sibling = sibling.nextElementSibling;
					}
				}
				if (isTrainerSection) break;
			}

			// Broad check for inclusion: profiles, dash, search bar results, search page, etc.
			const isSearch = el.closest(".search-result") || el.closest(".search-item") || el.closest(".tt-suggestion") || el.hasAttribute("data-search-item");
			const isPatronage = el.closest(".patronage-item") || el.closest(".user-infos") || isMainProfile || isTrainerSection || isSearch;

			if (isPatronage) {
				let pokeData;
				if (customPokeCache[login]) {
					const pokeName = customPokeCache[login];
					const foundPoke = pokemonList.find(p => p.name.toLowerCase() === pokeName.toLowerCase());
					pokeData = foundPoke ? { ...foundPoke } : getPokeDataForUser(login, isTrainerSection);
				} else {
					pokeData = getPokeDataForUser(login, isTrainerSection);
				}
				const container = document.createElement("span");
				container.className = "pokemon-container";
				
				const img = document.createElement("img");
				img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeData.id}.png`;
				img.className = "pokemon-sprite";
				
				let tooltipText = pokeData.name;
				// Only allow changing IF it is the user's OWN profile/dashboard
				// and the login matches the logged in user
				const loggedInUser = (document.querySelector(".main-navbar [data-login]")?.getAttribute("data-login") || "").toLowerCase();
				if (isMainProfile && !isTrainerSection && loggedInUser === login) {
					tooltipText += " (Click to change)";
					img.style.cursor = "pointer";
					img.addEventListener("click", async function(e) {
						e.preventDefault();
						const newPoke = prompt("Choose your Pokemon (e.g. Pikachu, Lucario, Greninja):", pokeData.name);
						if (newPoke) {
							const searchName = newPoke.toLowerCase().trim();
							const found = pokemonList.find(p => p.name.toLowerCase() === searchName);
							if (found) {
								customPokeCache[login] = found.name;
								
								// Sync locally
								await improvedStorage.set({ "custom-pokemon": customPokeCache });
								
							// Sync globally (Supabase)
							await updateGlobalPokemon(login, found.name);
							
							alert("Pokemon updated successfully! Please refresh the page to see your new partner.");
						} else {
								alert("Pokemon not found! Make sure you spelled it correctly (e.g. Bulbasaur, Rayquaza, Zacian).");
							}
						}
					});
				}
				img.title = tooltipText;
				
				container.appendChild(img);
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
