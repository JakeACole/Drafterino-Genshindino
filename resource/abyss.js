var character_data = [];

var active_section = null;
var char_map = {};
var p1_chars = [];
var p2_chars = [];
var abyss_teams = {};

const url_params = new URLSearchParams(window.location.search);

function generate_character_div(character) {
    let new_char_div = document.createElement('div');
    new_char_div.classList.add('character-icon');
    switch(character.star_rarity) {
        case 3:
            new_char_div.classList.add('three-star');
            break;
        case 4:
            new_char_div.classList.add('four-star');
            break;
        case 5:
            new_char_div.classList.add('five-star');
            break;
        default:
            break;
    }

    let new_char_img = document.createElement('img');
    if(character.alt_icons.length > 0 && Math.random() < 0.1) {
        new_char_img.src = "resource/" + 
            character.alt_icons[Math.floor(Math.random()*character.alt_icons.length)];
    }
    else {
        new_char_img.src = "resource/" + character.icon;
    }
    new_char_img.alt = character.name;
    new_char_img.classList.add('char-icon');
    new_char_div.appendChild(new_char_img);
    

    if (character.element != "none") {
        let new_element_img = document.createElement('img');
        new_element_img.src = "resource/Element_" + character.element.charAt(0).toUpperCase() + character.element.slice(1) + ".png";
        new_element_img.classList.add('element-icon');
        new_char_div.appendChild(new_element_img);
    }
    
    if (character.role != "none") {
        let new_role_img = document.createElement('img');
        new_role_img.src = "resource/role-" + character.role + ".webp";
        new_role_img.classList.add('role-icon');
        new_char_div.appendChild(new_role_img);
    }
    
    return new_char_div;
}

function ban_character(character_element) {
    let char_name = character_element.querySelector('img.char-icon').alt;
    // toggle banned class on self, then set banned class on character in main list
    let char_elem = document.getElementById("character-" + char_name);
    if (character_element.classList.contains("char-banned"))
    {
        character_element.classList.remove("char-banned");
        char_elem.classList.remove("char-banned");
    }
    else
    {
        character_element.classList.add("char-banned");
        char_elem.classList.add("char-banned");
    }
}

function set_captain(character_element) {
    let crown = character_element.parentElement.querySelector('.character-icon>img.crown-icon');
    crown.parentElement.removeChild(crown);
    character_element.appendChild(crown);

    // adjust crown in team lineups
    let team_crowns = document.querySelectorAll('.abyss-side-frame>.character-window>.character-icon>img.crown-icon');
    team_crowns.forEach(team_crown => {
        team_crown.parentElement.removeChild(team_crown);
    });

    // add crown to proper character
    let captain_name = character_element.querySelector('.character-icon>img.char-icon').alt;
    let team_characters = document.querySelectorAll('.abyss-side-frame>.character-window>.character-icon>img.char-icon');
    team_characters.forEach(team_character => {
        if (team_character.alt == captain_name) {
            team_character.parentElement.appendChild(crown.cloneNode(true));
        }
    });
}

function add_to_team(character_element) {
    let char_name = character_element.querySelector('img.char-icon').alt;
    if (!active_section || character_element.classList.contains("char-banned")) return;

    let abyss_team = abyss_teams[active_section.parentElement.id];
    if (abyss_team.length < 4 && !abyss_team.includes(char_name))
    {
        let new_char_node = character_element.cloneNode(true);
        active_section.appendChild(new_char_node);
        abyss_team.push(char_name);
        // add listener for clicking to ban
        new_char_node.addEventListener('click', event => {
            let elem = event.target;
            if (elem.nodeName == 'IMG') {
                elem = elem.parentElement;
            }
            ban_character(elem);
        });
    }
    else if (abyss_team.includes(char_name))
    {
        // toggle character
        let children_array = Array.from(active_section.children);
        children_array.forEach(elem => {
            let char_name_tmp = elem.querySelector('img.char-icon').alt;
            if (char_name == char_name_tmp) {
                active_section.removeChild(elem);
                abyss_team.splice(abyss_team.indexOf(char_name), 1);
            }
        });
    }
}

function populate_portraits() {

    // populate the 'character-pool-available' div with all portraits
    let p1_pool = document.getElementById('character-pool-p1');
    let p2_pool = document.getElementById('character-pool-p2');
    
    let p1_str = url_params.get('p1');
    if (p1_str) {
        p1_chars = p1_str.split(',');
    }
    let p2_str = url_params.get('p2');
    if (p2_str) {
        p2_chars = p2_str.split(',');
    }

    character_data.forEach(character => {
        if (p1_chars.includes(character.name) || p2_chars.includes(character.name)) {
            let new_char_div = generate_character_div(character);
            new_char_div.id = "character-" + character.name;
            new_char_div.addEventListener('click', (event) => {
                let elem = event.target;
                if (elem.nodeName == 'IMG') {
                    elem = elem.parentElement;
                }
                add_to_team(elem);
            });

            if (p1_chars.includes(character.name)) {
                p1_pool.appendChild(new_char_div);
            }
            else {
                p2_pool.appendChild(new_char_div);
            }

            // update global char_map for ease of access
            char_map[character.name] = character;
        }
    });

    // add crown
    let crown_img = document.createElement('img');
    crown_img.src = "resource/Item_Crown_of_Insight.webp";
    crown_img.classList.add('crown-icon');
    document.getElementById('character-pool-p1').firstElementChild.appendChild(crown_img);
    let p2_crown = crown_img.cloneNode(true);
    document.getElementById('character-pool-p2').firstElementChild.appendChild(p2_crown);
}

function set_active_section(button_node) {
    let active_buttons = document.querySelectorAll('.abyss-button.active');
    active_buttons.forEach(button => {
        button.classList.remove('active');
    });
    button_node.classList.add('active');
    active_section = button_node.parentElement.querySelector('.character-window');
}

function toggle_floor_visibility(label_elem) {
    let team_nodes = label_elem.parentElement.querySelectorAll(".abyss-side-frame");
    team_nodes.forEach(team_node => {
        team_node.classList.toggle("minimized");
        // toggle other side as well
        if (team_node.id.includes("p1")) {
            let otherside_id = team_node.id.replace("p1", "p2");
            let otherside_node = document.getElementById(otherside_id);
            otherside_node.classList.toggle("minimized");
        }
        else {
            let otherside_id = team_node.id.replace("p2", "p1");
            let otherside_node = document.getElementById(otherside_id);
            otherside_node.classList.toggle("minimized");
        }
    });
}

function goto_draft() {
    window.location = window.location.href.replace("abyss.html", "");
}

window.onload = (event) => {
    fetch("resource/characters.json").then(res => res.json()).then(data => {
        character_data = data;
        populate_portraits();
        enableDragSort('drag-sort-enable');
        const p1_observer = new MutationObserver((mutationList) => {
            if (mutationList[0].type == 'childList') {
                let p1_captain = document.getElementById('character-pool-p1').firstElementChild;
                set_captain(p1_captain);
            }
        });
        const p2_observer = new MutationObserver((mutationList) => {
            if (mutationList[0].type == 'childList') {
                let p2_captain = document.getElementById('character-pool-p2').firstElementChild;
                set_captain(p2_captain);
            }
        });
        p1_observer.observe(document.getElementById('character-pool-p1'), {childList: true});
        p2_observer.observe(document.getElementById('character-pool-p2'), {childList: true});
    });

    // set listeners for the buttons
    let buttons = document.querySelectorAll("button.abyss-button:not(.disabled-button)");
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            set_active_section(event.target);
        });
    });

    let labels = document.querySelectorAll(".abyss-floor-label");
    labels.forEach(label => {
        label.addEventListener('click', (event) => {
            toggle_floor_visibility(event.target);
        });
    });

    let abyss_team_elems = document.querySelectorAll(".abyss-side-frame");
    abyss_team_elems.forEach(elem => {
        abyss_teams[elem.id] = [];
    });
    
    let goto_button = document.getElementById('goto-draft');
    goto_button.addEventListener('click', (event) => {
        goto_draft();
    });
};

