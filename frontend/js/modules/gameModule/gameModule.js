import { resize, isFullScreen } from "./resize.js";
import { checkCollision } from "./collision.js";
import { displayMainMenu, createSelectMenu, createOnlineMenu, createLocalMenu } from './menu.js';
import { handleKeyPress, handleMenuKeyPress } from './handleKeyPress.js';
import { displayCharacter, updateMixers } from './displayCharacter.js';
import { initGame } from "./initGame.js";
import { createEndScreen, returnToMenu } from "./createEndScreen.js"
import { actualizeScore } from "./score.js";
import { createField } from "./createField.js";
import { createOnlineSelectMenu } from "./online.js";
import { ClearAllEnv } from "./createEnvironment.js";
import { loadAllModel } from "./loadModels.js"
import { loadScene } from "./loadModels.js";
import { getUserData } from "../../User.js";
import { sendTournamentForm, createFormTournament } from "./createTournament.js";
import { createJoinTournamentMenu } from "./joinTournament.js";
import { checkIfUserIsInTournament, connectToTournament } from "./tournament.js";
import { getModuleDiv, updateModule } from "../../Modules.js";
import { trainModel, AIMovement, storeData, resetAITimer } from "../AIModule/AI.js";
import { getState } from "../AIModule/envForAI.js";
import { setEditButtonProfile } from '../../Utils.js';

import { wsTournament } from "./tournament.js";
import { createTournamentHistoryMenu } from "./tournamentHistory.js";
import * as THREE from 'three';
import { injectElementTranslations } from "../translationsModule/translationsModule.js";
import { updateWinVariables } from "./varGlobal.js";
import { keyPress, keysPressed, setKeyPressToFalse } from "./handleKeyPress.js";
import { hostname } from "../../Router.js";

export var lobby;
export var clock;
export var characters;
export var states = [];
export var actions = [];
export var currentActions = [];
export var soloMode;
export var clockAI;
export var setTimer;

export const field = await createField();

export async function init() {
	var module = getModuleDiv("gameModule");
	if (!module)
		return;
	updateWinVariables();

	let btn = module.querySelector("#resizeGameBtn");
	btn.addEventListener('click', function() {
		btn.remove();
		updateModule("gameModule");
	});
	window.addEventListener('resize', function(event) {
		btn.hidden = false;
	});
	
	var target = document.querySelector('#game');
	var config = { attributes: true, childList: true, characterData: true };
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(async () => {
			await injectElementTranslations("#game")
		});
	});
	observer.observe(target, config);

	lobby = await loadScene('lobbyTest');
	clock = new THREE.Clock();
	clockAI = new THREE.Clock();
	characters = new Map();
	let start = false;
	let divMenu = document.getElementById("menu");
	let environment;
	let player1;
	let player2;
	let isOnline = false;
	let localLoop = false;
	let firstPrediction = true;
	let setTimer = true;
	let userData;
	let form;
	let model;
	let actualState;
	var gamediv = document.getElementById("game");

	await loadAllModel();

	window.addEventListener('resize', resize(environment));

	getUserData().then((data) => {
		userData = data;
		if (userData) {
			checkIfUserIsInTournament(userData).then((response) => {
				if (response && response['joined'] && !wsTournament)
					connectToTournament(response['tournament']);
			});
		}
	})

	async function goToLocalSelectMenu() {
		divMenu = document.getElementById("localMenu");
		divMenu.remove();
		environment = createSelectMenu(characters);
		player1 = await displayCharacter(player1, environment, "chupacabra", "player1");
		player2 = await displayCharacter(player2, environment, "elvis", "player2");
	}

	async function createAISelectMenu() {
		divMenu = document.getElementById("localMenu");
		divMenu.remove();
		environment = createSelectMenu(characters);
		document.getElementById("cursorP2").remove();
		document.getElementsByClassName("inputP2")[0].remove();
		environment.renderer.render(environment.scene, environment.camera);
		player1 = await displayCharacter(player1, environment, "chupacabra", "player1");
		player2 = await displayCharacter(player2, environment, "elvis", "player2");
	}

	gamediv.addEventListener("click", function (event) {
		getUserData().then((data) => {
			userData = data;
		})

		if (event.target.id == 'restart' && !isOnline) {
			document.getElementById("endscreen").remove();
			player1.score = 0;
			player2.score = 0;
			start = true;
			actualizeScore(player1, player2, environment, environment.font);
		}
		if (event.target.id == 'backMenu' || event.target.id == 'backIcon') {
			setEditButtonProfile(false);
			localLoop = false;
			isOnline = false;
			ClearAllEnv(environment);
			returnToMenu();
		}
		if (event.target.id == 'localGame') {
			localLoop = true;
			createLocalMenu(field);
		}
		if (event.target.id == '1v1') {
			soloMode = false;
			localGameLoop();
			goToLocalSelectMenu();
		}
		if (event.target.id == 'easy' || event.target.id == 'intermediate') {
			if (event.target.id == 'intermediate')
				setTimer = false;
			soloMode = true;
			localGameLoop();
			createAISelectMenu();
		}
		if (event.target.id == 'onlineGame' && userData) {
			isOnline = true;
			createOnlineMenu();
		}
		if (event.target.id == 'quick') {
			createOnlineSelectMenu(null);
		}
		if (event.target.id == 'create') {
			createFormTournament();
			form = document.getElementById("tournamentForm");
			form.addEventListener('submit', function (event) {
				event.preventDefault();
				sendTournamentForm(form);
			});
		}
		if (event.target.id == 'join') {
			createJoinTournamentMenu();
		}
		if (event.target.id == 'fullScreen') {
			if (!isFullScreen())
				gamediv.requestFullscreen();
			else
				document.exitFullscreen();
		}
		if (event.target.id == 'toggleButton') {
			const div = document.getElementById('toggleDiv');
			if (div.classList.contains('hidden'))
				div.classList.remove('hidden');
			else
				div.classList.add('hidden');
		}
		if (event.target.id == 'history') {
			createTournamentHistoryMenu();
		}
	});

	document.addEventListener('fullscreenchange', function () {
		if (!isOnline)
			resize(environment);
	});

	async function setIfGameIsEnd() {
		if (player1.score < 5 && player2.score < 5)
			return;

		let winner = player1.name;
		if (player2.score > player1.score)
			winner = player2.name;

		if (winner === "player1")
			winner = "player 1";
		else if (winner === "player2")
			winner = "player 2";

		firstPrediction = true;
		createEndScreen(winner);
		start = false;
	}

	async function localGameLoop() {
		if (keyPress && !start) {
			await handleMenuKeyPress(keysPressed, player1, player2, environment);
			setKeyPressToFalse()
		}
		if (keysPressed[" "] && document.getElementById("selectMenu") && player1 && player2 && !start) {
			start = true;
			ClearAllEnv(environment);
			divMenu.remove();
			model = await tf.loadLayersModel(`https://${hostname}:8000/js/modules/AIModule/model/model.json`);
			environment = await initGame(player1, player2);
			player1.score = 0;
			player2.score = 0;
		}
		if (start) {
			if (soloMode)
				AIMovement(player2, model, environment, firstPrediction);
			if (keyPress)
				handleKeyPress(keysPressed, player1, player2, environment);
			checkCollision(environment.ball, player1, player2, environment);
			resetAITimer(player1, player2, firstPrediction);
			await setIfGameIsEnd();
		}
		if (player1 && player2)
			updateMixers(player1, player2);
		environment?.renderer.render(environment.scene, environment.camera);
		if (localLoop)
			requestAnimationFrame(localGameLoop);
	}
}


export { displayMainMenu }