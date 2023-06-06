var character_data = [];

var active_section = null;

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

function populate_portraits() {

    // populate the 'character-pool-available' div with all portraits
    let avail_pool = document.getElementById('character-pool-available');
    let unavail_pool = document.getElementById('character-pool-unavailable');
    let p1_pool = document.getElementById('character-pool-p1');
    let p2_pool = document.getElementById('character-pool-p2');
    
    let p1_chars = [];
    let p1_str = url_params.get('p1');
    if (p1_str) {
        p1_chars = p1_str.split(',');
    }
    let p2_chars = [];
    let p2_str = url_params.get('p2');
    if (p2_str) {
        p2_chars = p2_str.split(',');
    }
    let unavail_chars = [];
    let unavail_str = url_params.get('unavail');
    if (unavail_str) {
        unavail_chars = unavail_str.split(',');
    }

    character_data.forEach(character => {
        let new_char_div = generate_character_div(character);
        if (p1_chars.includes(character.name)) {
            p1_pool.appendChild(new_char_div);
        }
        else if (p2_chars.includes(character.name)) {
            p2_pool.appendChild(new_char_div);
        }
        else if (unavail_chars.includes(character.name)) {
            unavail_pool.appendChild(new_char_div);
        }
        else {
            avail_pool.appendChild(new_char_div);
        }
        new_char_div.addEventListener('click', (event) => {
            let elem = event.target;
            console.log(elem);
            if (elem.nodeName == 'IMG') {
                elem = elem.parentElement;
            }
            if (active_section && elem.parentElement != active_section)
            {
                elem.parentElement.removeChild(elem);
                active_section.appendChild(elem);
            }
        });
    });
}

function set_active_section(button_node) {
    let active_buttons = document.querySelectorAll('.draft-button.active');
    active_buttons.forEach(button => {
        button.classList.remove('active');
    });
    button_node.classList.add('active');
    active_section = button_node.parentElement.querySelector('.character-window');
}

function goto_abyss() {
    let p1_pool_node = document.getElementById('character-pool-p1');
    let p2_pool_node = document.getElementById('character-pool-p2');

    let p1_chars = [];
    let p2_chars = [];

    let p1_character_nodes = Array.from(p1_pool_node.children);
    p1_character_nodes.forEach(node => {
        let char_img = node.querySelector('img.char-icon');
        p1_chars.push(char_img.alt);
    });

    let p2_character_nodes = Array.from(p2_pool_node.children);
    p2_character_nodes.forEach(node => {
        let char_img = node.querySelector('img.char-icon');
        p2_chars.push(char_img.alt);
    });

    let querystring = '?p1=' + p1_chars.join(',') + '&p2=' + p2_chars.join(',');
    window.location = location.origin + location.pathname + "abyss.html" + querystring;
}

window.onload = (event) => {

    fetch("resource/characters.json").then(res => res.json()).then(data => {
        character_data = data;
        populate_portraits();
    });

    // set listeners for the buttons
    let buttons = document.querySelectorAll("button.draft-button:not(.disabled-button)");
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            set_active_section(event.target);
        });
    });

    let goto_button = document.getElementById('goto-abyss');
    goto_button.addEventListener('click', (event) => {
        goto_abyss();
    });
};
