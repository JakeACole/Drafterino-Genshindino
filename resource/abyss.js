import character_data from './characters.json' assert {type: 'json'};

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
}

function set_active_section(button_node) {
    let active_buttons = document.querySelectorAll('.abyss-button.active');
    active_buttons.forEach(button => {
        button.classList.remove('active');
    });
    button_node.classList.add('active');
    active_section = button_node.parentElement.querySelector('.character-window');
}

window.onload = (event) => {
    populate_portraits();

    // set listeners for the buttons
    let buttons = document.querySelectorAll("button.abyss-button:not(.disabled-button)");
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            set_active_section(event.target);
        });
    });

    let abyss_team_elems = document.querySelectorAll(".abyss-side-frame");
    abyss_team_elems.forEach(elem => {
        abyss_teams[elem.id] = [];
    });
};

