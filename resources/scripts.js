var verbList = [];
var rndOrder = [];
var max_choices = 8;
var current_verb_id_te = 0, total_attempts_te = 0, correct_attempts_te = 0;
var current_verb_id_trans = 0, total_attempts_trans = 0, correct_attempts_trans = 0;
var rng_mode = 1; //0 (random, infinite), 1 (random, finite), 2 (set order, finite)

var table_symbol_count = 109;
var romajis = 
				  ["a", "i", "u", "e", "o", 
	               "ka", "ki", "ku", "ke", "ko", "kya", "kyu", "kyo",
				   "sa", "shi", "su", "se", "so", "sha", "shu", "sho",
				   "ta", "chi", "tsu", "te", "to", "cha", "chu", "cho",
				   "na", "ni", "nu", "ne", "no", "nya", "nyu", "nyo",
				   "ha", "hi", "fu", "he", "ho", "hya", "hyu", "hyo",
				   "ma", "mi", "mu", "me", "mo", "mya", "myu", "myo",
				   "ra", "ri", "ru", "re", "ro", "rya", "ryu", "ryo",
				   "ya", "yu", "yo", "wa", "wi", "we", "wo", "n",
				   "ga", "gi", "gu", "ge", "go", "gya", "gyu", "gyo",
				   "za", "ji", "zu", "ze", "zo", "ja", "ju", "jo",
				   "da", "di", "du", "de", "do", "dya", "dyu", "dyo",
				   "ba", "bi", "bu", "be", "bo", "bya", "byu", "byo",
				   "pa", "pi", "pu", "pe", "po", "pya", "pyu", "pyo"];
var hiraganas =
				  ["あ", "い", "う", "え", "お",
				   "か", "き", "く", "け", "こ", "きゃ", "きゅ", "きょ",
				   "さ", "し", "す", "せ", "そ", "しゃ", "しゅ", "しょ",
				   "た", "ち", "つ", "て", "と", "ちゃ", "ちゅ", "ちょ",
				   "な", "に", "ぬ", "ね", "の", "にゃ", "にゅ", "にょ",
				   "は", "ひ", "ふ", "へ", "ほ", "ひゃ", "ひゅ", "ひょ",
				   "ま", "み", "む", "め", "も", "みゃ", "みゅ", "みょ",
				   "ら", "り", "る", "れ", "ろ", "りゃ", "りゅ", "りょ",
				   "や", "ゆ", "よ", "わ", "ゐ", "ゑ", "を", "ん",
				   "が", "ぎ", "ぐ", "げ", "ご", "ぎゃ", "ぎゅ", "ぎょ",
				   "ざ", "じ", "ず", "ぜ", "ぞ", "じゃ", "じゅ", "じょ",
				   "だ", "ぢ", "づ", "で", "ど", "ぢゃ", "ぢゅ", "ぢょ",
				   "ば", "び", "ぶ", "べ", "ぼ", "びゃ", "びゅ", "びょ",
				   "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", "ぴゃ", "ぴゅ", "ぴょ"];
var katakanas = 
				  ["ア", "イ", "ウ", "エ", "オ",
				   "カ", "キ", "ク", "ケ", "コ", "キャ", "キュ", "キョ",
				   "サ", "シ", "ス", "セ", "ソ", "シャ", "シュ", "ショ",
				   "タ", "チ", "ツ", "テ", "ト", "チャ", "チュ", "チョ",
				   "ナ", "ニ", "ヌ", "ネ", "ノ", "ニャ", "ニュ", "ニョ",
				   "ハ", "ヒ", "フ", "ヘ", "ホ", "ヒャ", "ヒュ", "ヒョ",
				   "マ", "ミ", "ム", "メ", "モ", "ミャ", "ミュ", "ミョ",
				   "ラ", "リ", "ル", "レ", "ロ", "リャ", "リュ", "リョ",
				   "ヤ", "ユ", "ヨ", "ワ", "ヰ", "ヱ", "ヲ", "ン",
				   "ガ", "ギ", "グ", "ゲ", "ゴ", "ギャ", "ギュ", "ギョ",
				   "ザ", "ジ", "ズ", "ゼ", "ゾ", "ジャ", "ジュ", "ジョ",
				   "ダ", "ヂ", "ヅ", "デ", "ド", "ヂャ", "ヂュ", "ヂョ",
				   "バ", "ビ", "ブ", "ベ", "ボ", "ビャ", "ビュ", "ビョ",
				   "パ", "ピ", "プ", "ペ", "ポ", "ピャ", "ピュ", "ピョ"];
				   
//0: numbers; 1: letters; 2: hiragana; 3: katakana; 4: other
function detectSymbolType(value){
	value = value[0];
	if (value >= '0' && value <= '9') { return 0; }
	if (value.toLowerCase() !== value.toUpperCase()) { return 1; }
	for (let i = 0; i < table_symbol_count; i++) {
		if (value == hiraganas[i][0] || value == hiraganas[i][1]) { return 2; }
		if (value == katakanas[i][0] || value == katakanas[i][1]) { return 3; }
	}
	return 4;
}

function detectStringType(value){
	let results = [0, 0, 0, 0, 0];
	for (let i = 0; i < value.length; i++) {
		let j = detectSymbolType(value[i]);
		results[j] += 1;
	}
	let max_value = results[0];
	let max_id = 0;
	for (let i = 1; i < 5; i++) {
		if (results[i] > max_value) {
			max_id = i;
			max_value = results[i];
		}
	}
	return max_id;
}

function initialize(){
	stopTest();
	//creating some radiobuttons
	var container = document.getElementById('block_choices_table');
	var tr = document.createElement('tr');
	let i = 0;
	while (i < max_choices) {
		var td = document.createElement('td');
		var radiobox = document.createElement('input');
		radiobox.type = 'radio';
		radiobox.name = 'answerChoices';
		radiobox.id = 'answerChoice' + i;
		radiobox.value = 'incorrect';
		radiobox.classList.add('answer_options');
		var label = document.createElement('label')
		label.id = 'lblAnswerChoice' + i;
		label.htmlFor = 'answerChoice' + i;
		label.classList.add("more_readable");
		td.classList.add("choice_table_td");
		var description = document.createTextNode('answer' + i);
		label.appendChild(description);
		td.appendChild(radiobox);
		td.appendChild(label);
		tr.appendChild(td);
		//var newline = document.createElement('br');
		if (i % 2 == 1) {
			container.appendChild(tr);
			tr = document.createElement('tr');
		}
		i++;
	}
	if (i % 2 == 1) { container.appendChild(tr); }
	//
	document.getElementById("btn_start").disabled = true;
	document.getElementById("btn_nexttest").disabled = true;
	document.getElementById("id_file").addEventListener('change', (event) => {
		loadVerbs();
		stopTest();
		//firstInit();
	});
	document.getElementById("txt_query_overwrite").addEventListener("keyup", function(event) {
		if (event.key === "Enter") {
			document.getElementById("txt_answer_te").value = 
			romajify(document.getElementById("txt_query_overwrite").value);
		}
		//for testing only
	});
	document.getElementById("txt_answer_te").addEventListener("keyup", function(event) {
		if (event.key === "Enter") {
			AnswerTe(document.getElementById("txt_answer_te").value);
		}
	});
	document.getElementById("txt_answer_trans").addEventListener("keyup", function(event) {
		if (event.key === "Enter") {
			//AnswerTrans(document.getElementById("txt_answer_trans").value);
			verifyAnswer();
		}
	});
}

function getReward() {
    var snd = new Audio("resources/reward.dat");
    snd.play();
	document.getElementById("btn_reward").style = "display: none;";
}

function romajify(value){
	value += ":)";
	let final_result = "";
	let double_consonant = 0;
	for (let i = 0; i < value.length - 2; i++) {
		double_consonant -= 1;
		if (double_consonant < 0) { double_consonant = 0; }
		let s1 = value[i];
		let s2 = value[i] + value[i + 1];
		if (s1 == " " || s1 == "-" || s1 == "#" ||
		    s1 == "." || s1 == "?" || s1 == "!" || s1 == "ー" || s1 == "—") { continue; }
		//decided to delete some symbols while romajifying, wonder if it's ok...
		if (s1 == "っ" || s1 == "ッ") {
			double_consonant = 2;
			continue;
		}
		if (s1 == "、") {
			final_result += ",";
			continue;
		}
		if (s1.toLowerCase() !== s1.toUpperCase()) { //a cool letter check I found!
			final_result += s1.toLowerCase();
			continue;
		} 
		let symbol_found = 0;
		function hiragana_katakana_check(s_value) {
			if (symbol_found == 0) {
				for (let j = 0; j < table_symbol_count; j++) {
					if (hiraganas[j] == s_value) {
						if (double_consonant > 0) { final_result += romajis[j][0]; }
						final_result += romajis[j];
						symbol_found = 1;
						break;
					}
					if (katakanas[j] == s_value) {
						if (double_consonant > 0) { final_result += romajis[j][0]; }
						final_result += romajis[j];
						symbol_found = 1;
						break;
					}
				}
			}
		}
		hiragana_katakana_check(s2);
		if (symbol_found > 0) { i += 1; }
		hiragana_katakana_check(s1);
		if (symbol_found == 0) { final_result += s1; }
	}
	//quick patch: dunno how to deal with ha/wa in cases like "watashi wa"...
	//for now, deciding to convert all "ha" to "wa" while checking for correctness
	for (let i = 0; i < final_result.length - 1; i++) {
		if (final_result[i] == "h" && final_result[i + 1] == "a") {
			final_result[i] = "w";
		}
	}
	//
	return final_result;
}

function stopTest(){
	for (var i = 1; i <= 3; i++) {
		document.getElementById("orderChoice" + i).disabled = false;
	}
	document.getElementById("block_for_trans").style = "display: none;";
	document.getElementById("block_choices").style = "display: none;";
	document.getElementById("txt_answer_te").disabled = true;
	document.getElementById("txt_answer_trans").disabled = true;
	document.getElementById("btn_nexttest").disabled = true;
	document.getElementById("txt_query_overwrite").disabled = true;
	document.getElementById("btn_stop").disabled = true;
	document.getElementById("btn_start").disabled = false;
}

function verifyAnswer(){
	//let my_query = verbList[current_verb_id_trans][0];
	let my_query = document.getElementById('lbl_answer_trans').textContent;
	let my_answer = "<something>";
	let correct_answer = "<nothing>";
	let correct_id = -1;
	//check_mode = 0 for text, >0 for radiobutton
	let check_mode = parseInt(verbList[current_verb_id_trans][verbList[current_verb_id_trans].length - 1], 10);
	if (isNaN(check_mode)) { check_mode = 0; }
	if (check_mode == 0) {
		my_answer = document.getElementById("txt_answer_trans").value;
	} else {
		for (let i = 0; i < max_choices; i++) {
			let chk = document.getElementById("answerChoice" + i);
			let lbl = document.getElementById("lblAnswerChoice" + i);
			if (chk.checked == true) {
				my_answer = lbl.innerHTML;
				break;
			}
		}
	}
	for (let i = 0; i < max_choices; i++){
		let chk = document.getElementById("answerChoice" + i);
		let lbl = document.getElementById("lblAnswerChoice" + i);
		if (chk.value == "correct"){
			correct_answer = lbl.innerHTML;
			if (romajify(lbl.innerHTML) == romajify(my_answer))	{
				correct_id = i;
				break;
			}
		}
	}
	//now copying from AnswerTrans mostly...
	if (correct_id !== -1) {
		correct_attempts_trans += 1;
		document.getElementById("lbl_result_trans").firstChild.data =
		"Correct! " + my_query + " ==> " + correct_answer;
		document.getElementById("lbl_result_trans").style.color = "cyan";
	} else {
		document.getElementById("lbl_result_trans").firstChild.data =
		"«" + my_answer + "» is wrong! " + my_query + " ==> " + correct_answer;
		document.getElementById("lbl_result_trans").style.color = "red";
	}
	total_attempts_trans += 1;
	if (rng_mode == 0) { current_verb_id_trans = Math.floor(verbList.length * Math.random()); } else
	if (total_attempts_trans < verbList.length) {
		if (rng_mode == 1) { current_verb_id_trans = rndOrder[total_attempts_trans]; }
		if (rng_mode == 2) { current_verb_id_trans += 1; }
	}
	let final_result_text = "You have scored " + correct_attempts_trans +
							" out of " + total_attempts_trans + " so far. There are " +
							verbList.length + " tests in total. ";
	document.getElementById("lbl_final_results").firstChild.data = final_result_text;
	if (total_attempts_trans >= verbList.length && rng_mode !== 0) {
		if (correct_attempts_trans == total_attempts_trans) {
			document.getElementById("lbl_final_results").firstChild.data =
			final_result_text + "Good job! You deserve a reward. Claim it now!";
			document.getElementById("btn_reward").style = "display: inline-block;";
		} else {
			document.getElementById("lbl_final_results").firstChild.data =
			final_result_text + "That's all folks! ";
		}
		stopTest();
		return;
	}
	showTest(current_verb_id_trans);
}

function AnswerTrans(param){
	if (current_verb_id_trans < verbList.length) {
		ans = verbList[current_verb_id_trans][1];
		s = verbList[current_verb_id_trans][0];
	} else {
		ans = "";
		s = "(nothing yet)";
	}
	if (romajify(param) == romajify(ans)) {
		correct_attempts_trans += 1;
		document.getElementById("lbl_result_trans").firstChild.data =
		"Correct! The translation for '" + s + "' is '" + ans + "'";
		document.getElementById("lbl_result_trans").style.color = "cyan";
	} else {
		document.getElementById("lbl_result_trans").firstChild.data =
		"Wrong! The translation for '" + s + "' is '" + ans + "'";
		document.getElementById("lbl_result_trans").style.color = "red";
	}
	total_attempts_trans += 1;
	if (rng_mode == 0) { current_verb_id_trans = Math.floor(verbList.length * Math.random()); } else
	if (total_attempts_trans < verbList.length) {
		if (rng_mode == 1) { current_verb_id_trans = rndOrder[total_attempts_trans]; }
		if (rng_mode == 2) { current_verb_id_trans += 1; }
	}
	if (current_verb_id_trans < verbList.length) {
		s = verbList[current_verb_id_trans][0];
	} else {
		s = "(nothing yet)";
	}
	let final_result_text = "You have scored " + correct_attempts_trans +
							" out of " + total_attempts_trans + " so far. ";
	document.getElementById("lbl_final_results").firstChild.data = final_result_text;
	document.getElementById("lbl_answer_trans").firstChild.data =
	"Enter a translation for '" + s + "':";	
	document.getElementById("txt_answer_trans").value = "";
	document.getElementById("txt_answer_trans").focus();
	if (total_attempts_trans >= verbList.length && rng_mode !== 0) {
		if (correct_attempts_trans == total_attempts_trans) {
			document.getElementById("lbl_final_results").firstChild.data =
			final_result_text + "Good job! You deserve a reward. Claim it now!";
			document.getElementById("btn_reward").style = "display: inline-block;";
		} else {
			document.getElementById("lbl_final_results").firstChild.data =
			final_result_text + "That's all folks! ";
		}
		stopTest();
	}	
}

function AnswerTe(param){
	s = "";
	if (verbList.length > 0) { s = verbList[current_verb_id_te][1]; }
	if (document.getElementById("txt_query_overwrite").value !== "") {
		s = document.getElementById("txt_query_overwrite").value;
	}
	ans = "";
	s = romajify(s);
	param = romajify(param);
	//listing various exceptions first...
	if (s == "suru") { ans = "shite"; } else
	if (s == "kuru") { ans = "kite"; } else
	if (s == "iku")  { ans = "itte"; } else
	if (s == "hairu") { ans = "haitte"; } else
	if (s == "hashiru") { ans = "hashitte"; } else
	if (s == "iru") { ans = "itte"; } else
	if (s == "kaeru") { ans = "kaette"; } else
	if (s == "kagiru") { ans = "kagitte"; } else
	if (s == "kiru") { ans = "kitte"; } else
	if (s == "shaberu") { ans = "shabette"; } else
	if (s == "shiru") { ans = "shitte"; } else
	{
		q1 = s.substring(0, s.length - 1);
		q2 = s.substring(0, s.length - 2);
		q3 = s.substring(0, s.length - 3);
		q6 = s.substring(0, s.length - 6);
		sb2 = s.substring(s.length - 2, s.length + 1);
		sb3 = s.substring(s.length - 3, s.length + 1);
		sb6 = s.substring(s.length - 6, s.length + 1);
		if (sb2 == "bu" || sb2 == "mu" || sb2 == "nu") { ans = q2 + "nde"; } else
		if (sb6 == "wosuru") { ans = q6 + "woshite"; } else //new patch for "...wo suru"
		if (sb3 == "tsu") { ans = q3 + "tte"; } else
		if (sb2 == "su") { ans = q2 + "shite"; } else
		if (sb2 == "gu") { ans = q2 + "ide"; } else
		if (sb2 == "ku") { ans = q2 + "ite"; } else
		if (sb3 == "iru") { ans = q3 + "ite"; } else
		if (sb3 == "eru") { ans = q3 + "ete"; } else
		if (sb2 == "ru") { ans = q2 + "tte"; } else
		ans = q1 + "tte";
	}
	if (param == ans) {
		correct_attempts_te += 1
		document.getElementById("lbl_result_te").firstChild.data =
		"Correct! The -te form for " + s + " is " + ans + ".";
		document.getElementById("lbl_result_te").style.color = "blue";
	} else {
		document.getElementById("lbl_result_te").firstChild.data =
		"Wrong! The -te form for " + s + " is " + ans + ".";
		document.getElementById("lbl_result_te").style.color = "red";
	}
	total_attempts_te += 1
	current_verb_id_te = Math.floor(verbList.length * Math.random());
	if (verbList.length > 0) { s = verbList[current_verb_id_te][1]; }
	else {s = "(nothing yet)"; }
	document.getElementById("lbl_answer_te").firstChild.data =
	"(" + correct_attempts_te + "/" + total_attempts_te + ") Enter a -te form for " + s + ":";	
	document.getElementById("txt_answer_te").value = "";
	document.getElementById("txt_answer_te").focus();
}

function showTest(value){
	//0. Create a function to pull a random answer from a random test (non-current test)
	//and it shouldn't be identical to any existing answers.
	//It also should remove # from a pulled answer.
	//If it fails, let's say, 10 times, stop populating.
	//There should also be a function to compare answers,
	//taking an account that they can start with # (we need to ignore that)
	//1. Get a full list of answers, including random ones from other tests.
	//Population number is in accordance to the current test's testmode.
	//If no answers are marked as "correct", mark a first one as correct with #.
	//2. Get a numerical array of the same length, toss the numbers randomly, populate.
	let question_title = verbList[value][0][Math.floor(verbList[value][0].length * Math.random())];
	document.getElementById("lbl_answer_trans").firstChild.data = question_title;
	document.getElementById("txt_answer_trans").value = "";
	let pulled_answers = [];
	let pulled_order = [];
	function NormalizedAnswer(value){
		if (value[0] == '#') { return value.slice(1); } else { return value; }
	}
	function IdenticalAnswers(val1, val2){
		val1 = NormalizedAnswer(val1);
		val2 = NormalizedAnswer(val2);
		return (val1 == val2);
	}
	function GetRandomAnswer(){
		let indx = Math.floor(verbList.length * Math.random());
		if (indx == parseInt(value, 10)) { return ""; }
		let indx2 = 1 + Math.floor((verbList[indx].length - 2) * Math.random());
		if (verbList[indx][indx2] == "#") { return ""; }
		for (let i = 0; i < pulled_answers.length; i++) {
			if (IdenticalAnswers(pulled_answers[i], verbList[indx][indx2])) { return ""; }
		}
		return verbList[indx][indx2];
	}
	let do_not_fill = 0;
	for (let i = 1; i < verbList[value].length - 1; i++) {
		if (verbList[value][i] == "#") { do_not_fill = 1; break; }
		pulled_answers.push(verbList[value][i]);
		if (i >= max_choices) { break; }
	}
	let failed_to_fill = 0; //no idea if i'm ever gonna need this, but let it be
	let fill_limit = parseInt(verbList[value][verbList[value].length - 1], 10);
	if (fill_limit > max_choices) { fill_limit = max_choices; }
	//new: for radiobutton tests, of all correct answers, gonna delete all but one
	let correct_indices = [];
	for (let i = 0; i < pulled_answers.length; i++) {
		if (pulled_answers[i][0] == "#") { correct_indices.push(i); }
	}
	let remaining_correct_index = Math.floor(correct_indices.length * Math.random());
	let remaining_answer = pulled_answers[correct_indices[remaining_correct_index]];
	let new_pulled_answers = [];
	for (let i = 0; i < pulled_answers.length; i++) {
		if (pulled_answers[i][0] !== "#" || pulled_answers[i] == remaining_answer) {
			new_pulled_answers.push(pulled_answers[i]);
		}
	}
	pulled_answers = new_pulled_answers.slice();
	//new section ends here
	if (do_not_fill == 0) {
		while (pulled_answers.length < fill_limit) {
			let attempts = 0;
			let attempts_limit = 20;
			for (let i = 0; i < attempts_limit; i++) {
				let single_pull = GetRandomAnswer();
				if (single_pull !== "") {
					pulled_answers.push(NormalizedAnswer(single_pull));
					break;
				}
				attempts += 1;
			}
			if (attempts >= attempts_limit) {
				failed_to_fill = 1;
				break;
			}
		}
	}
	//
	for (let i = 0; i < pulled_answers.length; i++) {
		pulled_order.push(parseInt(i, 10));
	}
	for (var i = pulled_order.length - 1; i >= 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		k = pulled_order[i];
		pulled_order[i] = pulled_order[j];
		pulled_order[j] = k;
	}
	//
	for (let i = 0; i < pulled_order.length; i++) {
		let answ = pulled_answers[pulled_order[i]];
		let lbl = document.getElementById("lblAnswerChoice" + i);
		lbl.innerHTML = NormalizedAnswer(answ).trim();
		let chk = document.getElementById("answerChoice" + i);
		if (answ[0] == '#') {
			chk.value = "correct";
		} else {
			chk.value = "incorrect";
		}
		chk.style = "display: inline-block;";
		lbl.style = "display: inline;";
		if (i == 0) { chk.checked = true; }
	}
	for (let i = pulled_order.length; i < max_choices; i++) {
		let lbl = document.getElementById("lblAnswerChoice" + i);
		let chk = document.getElementById("answerChoice" + i);
		chk.value = "incorrect";
		chk.style = "display: none;";
		lbl.style = "display: none;";
	}
	if (fill_limit == 0) {
		document.getElementById("block_for_trans").style = "display: block;";
		document.getElementById("block_choices").style = "display: none;";
		document.getElementById("txt_answer_trans").focus();
	} else {
		document.getElementById("block_for_trans").style = "display: none;";
		document.getElementById("block_choices").style = "display: block;";
	}
	return;
}

function firstInit() { //commented out async, don't think i need it anymore
	//await new Promise(r => setTimeout(r, 100));
	current_verb_id_te = Math.floor(verbList.length * Math.random());
	current_verb_id_trans = Math.floor(verbList.length * Math.random());
	total_attempts_te = 0;
	correct_attempts_te = 0;
	total_attempts_trans = 0;
	correct_attempts_trans = 0;	
	if (verbList.length > 0) {
		rndOrder = [];
		//making a random order pool here
		for (var i = 0; i < verbList.length; i++) {
			rndOrder.push(i);
		}
		for (var i = verbList.length - 1; i >= 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			k = rndOrder[i];
			rndOrder[i] = rndOrder[j];
			rndOrder[j] = k;
		}
		//checking rng_mode
		if (document.getElementById("orderChoice1").checked == true) { rng_mode = 0;
		current_verb_id_trans = Math.floor(verbList.length * Math.random()); } else
		if (document.getElementById("orderChoice2").checked == true) { rng_mode = 1;
		current_verb_id_trans = rndOrder[0]; } else
		if (document.getElementById("orderChoice3").checked == true) { rng_mode = 2;
		current_verb_id_trans = 0; }
		//
		document.getElementById("lbl_answer_te").firstChild.data =
		"Enter a -te form for " + verbList[current_verb_id_te][1] + ":";	
		document.getElementById("lbl_answer_trans").firstChild.data =
		verbList[current_verb_id_trans][0];
		//new stuff
		do_things = showTest(current_verb_id_trans);
	} else {
		document.getElementById("lbl_answer_trans").firstChild.data =
		"No test queries are detected. Please select another file.";
		return;
	}
	for (var i = 1; i <= 3; i++) {
		document.getElementById("orderChoice" + i).disabled = true;
	}
	document.getElementById("btn_reward").style = "display: none;";
	document.getElementById("lbl_final_results").firstChild.data = 
	"Here be final results of the test.";
	document.getElementById("lbl_result_te").firstChild.data =
	"This will display whether the answer is correct or not.";
	document.getElementById("lbl_result_trans").firstChild.data =
	"This will display whether the answer is correct or not.";
	document.getElementById("lbl_result_te").style.color = "#eee";
	document.getElementById("lbl_result_trans").style.color = "#eee";
	document.getElementById("btn_stop").disabled = false;
	document.getElementById("txt_answer_te").disabled = false;
	document.getElementById("txt_answer_trans").disabled = false;
	document.getElementById("txt_query_overwrite").disabled = false;
	document.getElementById("btn_nexttest").disabled = false;
	document.getElementById("txt_answer_te").value = "";
	document.getElementById("txt_answer_trans").value = "";
	document.getElementById("txt_answer_trans").focus();
	document.getElementById("btn_start").disabled = true;
}

async function loadVerbs(){
	
	verbList = [];
	
	let input = document.getElementById('id_file');
	let textarea = document.querySelector('textarea');
	let files = input.files;
    if (files.length == 0) return;
	const file = files[0];
 
    let reader = new FileReader();
	let console_debug = 0;
	let final_push_counter = 0;
	
	let current_splitter = '|';
	let splitter_cooldown = 0;
	let reverse_state = 0;
	//new
	let test_mode = 0; //0 for text, >0 is for radiobuttons with test_mode choices
	let questlist = [1]; //a list of argument IDs that can be questions (IDs start from 1)
	let skiplist = []; //a list of argument IDs to delete (processed next)
	//newer
	let test_mode_backup = 0;
	let questlist_backup = [1];
	let skiplist_backup = [];
	//multirow stuff
	let multirow_limit = 1;
	let multirow_count = 0;
	let past_rows = "";
	//pattern stuff
	let pattern_collection_mode = 0;
	let patterns = [];
	let pt_last = -1;
	
	function InsertNonEmpty(value){
		value = value.trim();
		if (value == '') { return; }
		let splt = value.split('|');
		splt[0] = splt[0].toLowerCase();
		if (splt[0] == "#debug") {
			if (splt[1] == "on")  { console_debug = 1; } else
			if (splt[1] == "off") { console_debug = 0; } else
			console_debug = 1 - console_debug;
			return;
		}
		if (splt[0] == "#split") {
			current_splitter = splt[1];
			if (current_splitter == "default") { current_splitter = "|"; }
			splitter_cooldown = parseInt(splt[2], 10);
			
			if (current_splitter == undefined || current_splitter == "") {
				current_splitter = '|';
			}
			
			if (isNaN(splitter_cooldown)) {
				splitter_cooldown = 1000000000;
			}
			splitter_cooldown = Math.abs(splitter_cooldown);
			return;
		}
		if (splt[0] == "#text") {
			if (pattern_collection_mode == 1) {
				patterns[pt_last][3] = 0;
			} else {
				test_mode = 0;
			}
			return;
		}
		if (splt[0] == "#choice") {
			let new_test_mode = parseInt(splt[1], 10);
			if (isNaN(new_test_mode)) { new_test_mode = 4; }
			if (new_test_mode > max_choices) { net_test_mode = max_choices; }
			if (pattern_collection_mode == 1) {
				patterns[pt_last][3] = new_test_mode;
			} else {
				test_mode = new_test_mode;
			}
			return;
		}
		if (splt[0] == "#reverse") {
			if (splt[1] == "on")  { reverse_state = 1; } else
			if (splt[1] == "off") { reverse_state = 0; } else
			reverse_state = 1 - reverse_state;
			return;
		}
		if (splt[0] == "#multirow" || splt[0] == "#multiline") {
			multirow_limit = parseInt(splt[1], 10);
			if (isNaN(multirow_limit)) { multirow_limit = 1; }
			multirow_count = 0;
			past_rows = "";
			return;
		}
		if (splt[0] == "#skip") {
			let new_skiplist = [];
			for (let w = 1; w <= 1000000000; w++) {
				let x = parseInt(splt[w], 10);
				if (isNaN(x)) { break; }
				new_skiplist.push(x);
			}
			if (pattern_collection_mode == 1) {
				patterns[pt_last][2] = new_skiplist.slice();
			} else {
				skiplist = new_skiplist.slice();
			}
			return;
		}
		if (splt[0] == "#ask") {
			let new_questlist = [];
			for (let w = 1; w <= 1000000000; w++) {
				x = parseInt(splt[w], 10);
				if (isNaN(x)) { break; }
				new_questlist.push(x);
			}
			if (new_questlist.length == 0) { new_questlist.push(1); }
			if (pattern_collection_mode == 1) {
				patterns[pt_last][1] = new_questlist.slice();
			} else {
				questlist = new_questlist.slice();
			}			
			return;
		}
		if (splt[0] == "#pattern" && splt.length > 0) {
			pattern_collection_mode = 1;
			pt_last += 1;
			patterns.push("");
			patterns[pt_last] = [];
			patterns[pt_last].push("");
			patterns[pt_last][0] = []; //the pattern arrangement will be here
			patterns[pt_last].push("");
			patterns[pt_last][1] = []; //list of #ask IDs will be here
			patterns[pt_last][1].push("none");
			patterns[pt_last].push("");
			patterns[pt_last][2] = []; //list of #skip IDs will be here
			patterns[pt_last][2].push("none");
			patterns[pt_last].push("none"); //a test mode ("none" inherits from global)
			for (let w = 1; w < splt.length; w++) {
				let arg = splt[w].toLowerCase();
				if (arg == "numbers" || arg == "number" || arg == "num") {
					patterns[pt_last][0].push(0);
				} else if (arg == "letters" || arg == "letter" || arg == "ltr") {
					patterns[pt_last][0].push(1);
				} else if (arg == "hiragana" || arg == "hrg") {
					patterns[pt_last][0].push(2);
				} else if (arg == "katakana" || arg == "ktk") {
					patterns[pt_last][0].push(3);
				} else if (arg == "other" || arg == "oth" || arg == "otr") {
					patterns[pt_last][0].push(4);
				} else if (arg == "japanese" || arg == "jpn") {
					patterns[pt_last][0].push(6);
				} else { patterns[pt_last][0].push(5); }
			}
			return;
		}
		if (splt[0] == "#end") {
			if (pattern_collection_mode == 1) { pattern_collection_mode = 0; }
			return;
		}
		function checkPatternMatch(){ //will return -1 if no match, otherwise returns match ID
			let value_to_check = past_rows.split(current_splitter).filter(x => x.trim());
			for (let i = 0; i < value_to_check.length; i++) {
				value_to_check[i] = parseInt(detectStringType(value_to_check[i]), 10);
			}
			for (let i = 0; i < patterns.length; i++) {
				let k = 0;
				for (let j = 0; j < patterns[i][0].length; j++) {
					if (patterns[i][0][j] == 6) {
						if (value_to_check[j] < 2 || value_to_check[j] > 4) {
							k = 1;
							break;
						}
					} else
					if (patterns[i][0][j] !== value_to_check[j] && patterns[i][0][j] !== 5) {
						k = 1;
						break;
					}
				}
				if (k == 0) { return i; }
			}
			return -1;
		}
		if (value[0] !== ';') {
			//new (multirow)
			pattern_collection_mode = 0;
			multirow_count += 1;
			past_rows += value + current_splitter;
			let match_id = checkPatternMatch();
			if (match_id >= 0) {
				test_mode_backup = test_mode;
				questlist_backup = questlist.slice();
				skiplist_backup = skiplist.slice();
				
				if (patterns[match_id][3] !== "none") {
					test_mode = parseInt(patterns[match_id][3], 10);
				}
				if (patterns[match_id][1][0] !== "none") {
					questlist = patterns[match_id][1].slice();
				}
				if (patterns[match_id][2][0] !== "none") {
					skiplist = patterns[match_id][2].slice();
				}
				
				value = past_rows;
				past_rows = "";
				multirow_count = 0;
			} else if (multirow_count >= multirow_limit) {
				value = past_rows;
				past_rows = "";
				multirow_count = 0;
			} else { return; }
			//ends multirow block
			if (reverse_state == 1) { 
				value = "" + test_mode + current_splitter + value;
			} else {
				value = value + current_splitter + test_mode;
			}
			let value_to_add = value.split(current_splitter).filter(x => x.trim());
			if (reverse_state == 1) { value_to_add.reverse(); }
			if (value_to_add.length > 2) { 
				if (value_to_add[1] !== "#") {
					//new block: processing #ask and #skip
					value_to_add.splice(0, 0, "");
					value_to_add[0] = [];
					for (j = 0; j < questlist.length; j++) {
						value_to_add[0].push(value_to_add[questlist[j]]);
					}
					let new_value_to_add = [];
					new_value_to_add.push(value_to_add[0]);
					for (j = 1; j < value_to_add.length; j++) {
						let need_skip = 0;
						for (let k = 0; k < questlist.length; k++) {
							if (questlist[k] == j) { need_skip = 1; break; }
						}
						for (let k = 0; k < skiplist.length; k++) {
							if (skiplist[k] == j) { need_skip = 1; break; }
						}
						if (need_skip == 1) { continue; }
						new_value_to_add.push(value_to_add[j]);
					}
					value_to_add = new_value_to_add.slice();
					//end of new block
					let correct_marked = 0;
					for (j = 1; j < value_to_add.length - 1; j++) {
						if (value_to_add[j] == "#") { break; }
						if (value_to_add[j][0] == "#") { correct_marked = 1; break; }
					}
					if (correct_marked == 0) { value_to_add[1] = "#" + value_to_add[1]; }
					verbList.push(value_to_add);
					//some debug
					final_push_counter += 1;
					if (console_debug > 0) {
						console.log("Test #" + final_push_counter + " is here:");
						console.log(value_to_add);
					}
					//debug end
					splitter_cooldown -= 1;
					if (splitter_cooldown == 0) { current_splitter = '|'; }
					//
					if (match_id >= 0) {
						test_mode = test_mode_backup;
						questlist = questlist_backup.slice();
						skiplist = skiplist_backup.slice();
					}
				}
			}
		}
	}
 
    reader.onload = (e) => {
        const file = e.target.result;
        const lines = file.split(/\r\n|\n/);
        //textarea.value = lines.join('\n');
		lines.forEach(element => InsertNonEmpty(element));
    }; 
	
	document.getElementById("btn_start").disabled = false;
	
	reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(file);
}