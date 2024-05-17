var character_data = [];
var character_map = {};
var attribute_map = {};
var last_sort = '';
var sort_direction = 1;
var active_section = null;
var saved_chars = {
    'p1': [],
    'p2': [],
    'unavail': []
};

const url_params = new URLSearchParams(window.location.search);

function update_cookie_state() {
    ['p1', 'p2', 'unavail'].forEach(key => {
        saved_chars[key] = [];
        let pool = document.getElementById('character-pool-' + key);
        pool.querySelectorAll('.character-icon > img.char-icon').forEach(img => {
            saved_chars[key].push(img.alt);
        });
        document.cookie = key + '=' + JSON.stringify(saved_chars[key]);
    });
}

function move_character(elem) {
    if (active_section && elem.parentElement != active_section)
    {
        move_character_to_section(elem, active_section);
    }
}

function move_character_to_section(elem, section) {
    elem.parentElement.removeChild(elem);
    section.appendChild(elem);
    update_cookie_state();
}

function populate_portraits() {

    // populate the 'character-pool-available' div with all portraits
    let avail_pool = document.getElementById('character-pool-available');
    let unavail_pool = document.getElementById('character-pool-unavail');
    let p1_pool = document.getElementById('character-pool-p1');
    let p2_pool = document.getElementById('character-pool-p2');
    
    let previous_data = document.cookie.split('; ');
    previous_data.forEach(cookie_val => {
        if(cookie_val.startsWith('p1=')) {
            saved_chars['p1'] = JSON.parse(cookie_val.replace('p1=',''));
        }
        if(cookie_val.startsWith('p2=')) {
            saved_chars['p2'] = JSON.parse(cookie_val.replace('p2=',''));
        }
        if(cookie_val.startsWith('unavail=')) {
            saved_chars['unavail'] = JSON.parse(cookie_val.replace('unavail=',''));
        }
    });

    let p1_str = url_params.get('p1');
    if (p1_str) {
        saved_chars['p1'] = saved_chars['p1'].concat(p1_str.split(','));
    }
    let p2_str = url_params.get('p2');
    if (p2_str) {
        saved_chars['p2'] = saved_chars['p2'].concat(p2_str.split(','));
    }
    let unavail_str = url_params.get('unavail');
    if (unavail_str) {
        saved_chars['unavail'] = saved_chars['unavail'].concat(unavail_str.split(','));
    }
    
    ['p1', 'p2', 'unavail'].forEach(key => {
        saved_chars[key] = [...new Set(saved_chars[key])]; // remove duplicates
        document.cookie = key + '=' + JSON.stringify(saved_chars[key]);
    });

    character_data.forEach(character => {
        character_map[character.name] = character;
        let new_char_div = generate_character_div(character);
        if (saved_chars['p1'].includes(character.name)) {
            p1_pool.appendChild(new_char_div);
        }
        else if (saved_chars['p2'].includes(character.name)) {
            p2_pool.appendChild(new_char_div);
        }
        else if (saved_chars['unavail'].includes(character.name)) {
            unavail_pool.appendChild(new_char_div);
        }
        else {
            avail_pool.appendChild(new_char_div);
        }
        new_char_div.addEventListener('click', (event) => {
            let elem = event.target;
            move_character(elem);
        });
        new_char_div.addEventListener('dragend', (event) => {
            update_cookie_state();
        });
    });
}

function set_active_section(button_node) {
    let active_buttons = document.querySelectorAll('.draft-button.active');
    active_buttons.forEach(button => {
        button.classList.remove('active');
    });
    event_section = button_node.parentElement.querySelector('.character-window');
    if (event_section != active_section) {
        button_node.classList.add('active');
        active_section = button_node.parentElement.querySelector('.character-window');
    }
    else {
        active_section = null;
    }
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

function sort_characters(key) {
    let avail_list = document.getElementById("character-pool-available");
    let char_list = avail_list.children;

    if(last_sort == key) {
        sort_direction = sort_direction * -1;
    }
    else {
        sort_direction = 1;
    }

    let char_array = Array.from(char_list);
    char_array.sort((a, b) => {
        let name_a = a.querySelector("img.char-icon").alt;
        let name_b = b.querySelector("img.char-icon").alt;

        return character_map[name_a][key] == character_map[name_b][key] ? 0 
            : (character_map[name_a][key] > character_map[name_b][key] ? 1*sort_direction : -1*sort_direction);
    });

    char_array.forEach(char_node => {
        avail_list.appendChild(char_node);
    });

    last_sort = key;
}

function reset_teams() {
    let prev_active_section = active_section;
    active_section = document.getElementById('character-pool-available');
    Array.from(document.getElementById('character-pool-p1').children).forEach(char => {
        move_character(char);
    });
    Array.from(document.getElementById('character-pool-p2').children).forEach(char => {
        move_character(char);
    });
    active_section = prev_active_section;
}

function populate_ban_form(attributes) {
    let attr_dropdown = document.getElementById("ban-attribute");
    let exclude_dropdown = document.getElementById("ban-exclude-attribute");
    for (attr in attributes) {
        var opt = document.createElement("option");
        opt.value = attr;
        opt.innerHTML = attr;
        attr_dropdown.appendChild(opt);
        attributes[attr].forEach(attr_value => {
            var exclude_opt = document.createElement("option");
            let val = attr+"="+attr_value;
            exclude_opt.value = val;
            exclude_opt.innerHTML = val;
            exclude_dropdown.appendChild(exclude_opt);
        });
    }
    update_ban_form();
}

function update_ban_form(refresh=false) {
    let ban_prompt = document.getElementById("character-ban-prompt");
    let exclude_prompt = document.getElementById("character-ban-exclude-prompt");
    let attr = document.getElementById("ban-attribute").value;
    if (attr == "none") {
        ban_prompt.classList.add("hidden");
        exclude_prompt.classList.add("hidden");
    }
    else if (ban_prompt.classList.contains("hidden") || refresh == true) {
        let ban_value_select = document.getElementById("ban-value");
        // remove options in ban-value select
        let i, L = ban_value_select.options.length - 1;
        for(i = L; i > 0; i--) {
            ban_value_select.remove(i);
        }
        // add options in ban-value select
        attribute_map[attr].forEach(val => {
            var opt = document.createElement("option");
            opt.value = val;
            opt.innerHTML = val;
            ban_value_select.appendChild(opt);
        });

        ban_prompt.classList.remove("hidden");
        exclude_prompt.classList.remove("hidden");
    }
    // update text values
    document.getElementById("ban-quantity-text").innerHTML = document.getElementById("ban-quantity").value;
    document.getElementById("ban-attribute-text").innerHTML = attr;
}

function ban_random_chars(attr, value, count) {
    // get list of chars with matching attr value
    let chars = []
    let avail_section = document.getElementById("character-pool-available");
    let exclude = document.getElementById("ban-exclude").checked;
    let exclude_str = document.getElementById("ban-exclude-attribute").value;
    let exclude_split = exclude_str.split("=");
    let exclude_attr = exclude_split[0];
    let exclude_value = exclude_split[exclude_split.length-1];
    character_data.forEach(char => {
        character_elem = document.getElementById("character-" + char.name);
        if (char[attr] == value && character_elem.parentElement == avail_section) {
            if (!exclude || char[exclude_attr] != exclude_value) {
                chars.push(char.name);
            }
        }
    });
    console.log(chars);
    ban_section = document.getElementById("character-pool-banned");
    for (let i = 0; i < count && chars.length > 0; i++) {
        char_index = Math.floor(Math.random() * chars.length);
        let char_name = chars[char_index];
        let char_div = document.getElementById("character-" + char_name);
        move_character_to_section(char_div, ban_section);
        chars.splice(char_index, 1);
    }
}

function perform_ban() {
    let ban_attr = document.getElementById("ban-attribute").value;
    let ban_count = parseInt(document.getElementById("ban-quantity").value);
    let ban_value = document.getElementById("ban-value").value;
    if (ban_value == "each") {
        attribute_map[ban_attr].forEach(val => {
            ban_random_chars(ban_attr, val, ban_count);
        })
    }
    else {
        ban_random_chars(ban_attr, ban_value, ban_count);
    }
}

window.addEventListener('load', (event) => {

    fetch("resource/characters.json").then(res => res.json()).then(data => {
        character_data = data;
        populate_portraits();
        enableDragSort('drag-sort-enable');
    });

    fetch("resource/attributes_plain.json").then(res => res.json()).then(data => {
        attribute_map = data;
        populate_ban_form(attribute_map);
        let num_input = document.getElementById("ban-quantity");
        num_input.addEventListener('change', update_ban_form);
        let attribute_input = document.getElementById("ban-attribute");
        attribute_input.addEventListener('change', (event) => {
            update_ban_form(refresh=true);
        });
        let ban_button = document.getElementById("button-ban");
        ban_button.addEventListener('click', perform_ban);
    })

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

    let reset_button = document.getElementById('reset-teams');
    reset_button.addEventListener('click', (event) => {
        reset_teams();
    });

    let sort_buttons = document.querySelectorAll("button.sort-button");
    sort_buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            sort_characters(event.target.id.replace("sort-by-", ""));
        });
    });
});

