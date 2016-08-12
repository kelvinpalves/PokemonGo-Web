"use strict";angular.module("pokemonGoWebViewApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","ngMap","ui.bootstrap"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/map.html"}).otherwise({redirectTo:"/"})}]),angular.module("pokemonGoWebViewApp").controller("MainCtrl",["$scope","NgMap","$rootScope","EventService","BotManager",function(a,b,c,d,e){a.sidebar_shown=!0,a.bots=e.load(userInfo.users),console.log("Accounts loaded: ",a.bots),a.maps=[],a.$on("mapInitialized",function(b,c){a.maps.push(c)}),a.map_pokemons=[],a.events=[]}]),angular.module("pokemonGoWebViewApp").directive("autoSizeContainer",["$window",function(a){return{restrict:"A",link:function(b,c,d){var e=function(){var d=$(".navbar-collapse").height(),e=b.sidebar_shown?$(".side-nav").width():0;c.height(a.innerHeight-d),c.width(a.innerWidth-e),b.maps.length>0&&angular.forEach(b.maps,function(a){google.maps.event.trigger(a,"resize")})};e(),angular.element(a).bind("resize",function(){e(),b.$digest()}),b.$watch("sidebar_shown",function(){e()})}}}]),angular.module("pokemonGoWebViewApp").service("EventService",["$rootScope",function(a){var b=io.connect("http://"+document.domain+":4000"),c=b.onevent;return b.onevent=function(a){var b=a.data||[];c.call(this,a),a.data=["*"].concat(b),c.call(this,a)},{on:function(c,d){b.on(c,function(){var c=arguments;a.$apply(function(){d.apply(b,c)})})},emit:function(c,d,e){b.emit(c,d,function(){var c=arguments;a.$apply(function(){e&&e.apply(b,c)})})}}}]),angular.module("pokemonGoWebViewApp").service("BotManager",["EventService","ToolService","$interval",function(a,b,c){function d(a){for(var b=0,c=0;c<a.length;c++)b=a.charCodeAt(c)+((b<<5)-b);var d=(16777215&b).toString(16).toUpperCase();return"#"+"00000".substring(0,6-d.length)+d}var e=b.pokemonData(),f=function(a){var c=a.account,d=a.result.player.player_data,f=a.result.inventory.inventory_delta.inventory_items;j[c].candies=[],j[c].pokedex=[],j[c].inventory=[],g(c),j[c].eggs=[],j[c].pokemons=[],angular.forEach(f,function(a){if(a=a.inventory_item_data,a.hasOwnProperty("pokemon_data")){var d=a.pokemon_data;d.hasOwnProperty("is_egg")?j[c].eggs.push(d):(d.pid=b.toThreeDigits(d.pokemon_id),d.name=e[d.pokemon_id],d.iv=parseFloat((d.individual_attack+d.individual_defense+d.individual_stamina)/45).toFixed(2),j[c].pokemons.push(d))}else a.hasOwnProperty("candy")?j[c].candies.push(a.candy):a.hasOwnProperty("pokedex_entry")?j[c].pokedex[a.pokedex_entry.pokemon_id].caught=!0:a.hasOwnProperty("item")?(a.item.name=b.getItemById(a.item.item_id),j[c].inventory.push(a.item)):a.hasOwnProperty("player_stats")?j[c].player_stats=a.player_stats:a.hasOwnProperty("egg_incubators")&&(j[c].egg_incubators=a.egg_incubators)}),delete d.username,j[c]=angular.merge(j[c],d)},g=function(a){angular.forEach(e,function(b,c){j[a].pokedex[c]={caught:!1}})},h={name:"",position:null,location_history:[],shown_on_map:!0,inventory:[],egg_incubators:[],pokedex:[],eggs:[],candies:[],pokemons:[],player_stats:{},follow_on_map:!1},i=function(b){a.emit("remote:send_request",{name:"get_player_info",account:b})},j={};return{load:function(b){return angular.forEach(b,function(b){var e=d(b),k=angular.copy(h);k.name=b,k.color=e,j[b]=k,g(b),a.on("get_player_info:"+b,f),i(b),c(function(){i(b)},1e4)}),j},getBots:function(){return j}}}]),angular.module("pokemonGoWebViewApp").controller("MapCtrl",["$scope","NgMap","$rootScope","EventService","BotManager","ToolService",function(a,b,c,d,e,f){a.map_center=null;var g=function(b){b.hasOwnProperty("data")&&b.data.hasOwnProperty("current_position")&&(a.bots[b.account].location_history.push(b.data.current_position),a.bots[b.account].position=b.data.current_position,a.map_center&&!a.bots[b.account].follow_on_map||(a.map_center=b.data.current_position))},h=function(b){angular.forEach(a.map_pokemons,function(c){if(c.encounter_id===b.data.encounter_id){var d=a.map_pokemons.indexOf(c);a.map_pokemons=a.map_pokemons.splice(d,0)}})};c.$on("follow_bot_on_map",function(b,c){angular.forEach(a.bots,function(a){a.follow_on_map=!1}),a.bots[c.name].follow_on_map=!a.bots[c.name].follow_on_map;var d=angular.copy(c.position);a.map_center=d}),c.$on("find_bot_on_map",function(b,c){console.log("Request to find the following bot",c);var d=angular.copy(c.position);a.map_center=d}),angular.forEach(e.getBots(),function(b){d.on("pokemon_appeared:"+b.name,function(b){var c=b.data;c.id=f.toThreeDigits(c.pokemon_id),c.position=b.data.latitude+", "+b.data.longitude,a.map_pokemons.push(c)}),d.on("pokemon_caught:"+b.name,h),d.on("pokemon_vanished:"+b.name,h),d.on("moving_to_fort:"+b.name,g),d.on("moving_to_lured_fort:"+b.name,g),d.on("position_update:"+b.name,g),d.on("arrived_at_fort:"+b.name,g)})}]),angular.module("pokemonGoWebViewApp").controller("MenuCtrl",["$scope","NgMap","$rootScope","EventService","BotManager","$uibModal","ToolService",function(a,b,c,d,e,f,g){a.bots=e.getBots(),a.popup=function(a,b){var c=b+"Ctrl";f.open({animation:!0,templateUrl:"views/modals/"+b+".html",controller:c,size:"lg",resolve:{selectedBot:function(){return a}}})},a.getLevelPercent=function(a,b){return a&&b?g.getLevelPercent(a,b):0},a.followBot=function(a){c.$emit("follow_bot_on_map",a)},a.findBot=function(a){c.$emit("find_bot_on_map",a)}}]),angular.module("pokemonGoWebViewApp").service("ToolService",function(){var a={1:"Bulbasaur",2:"Ivysaur",3:"Venusaur",4:"Charmander",5:"Charmeleon",6:"Charizard",7:"Squirtle",8:"Wartortle",9:"Blastoise",10:"Caterpie",11:"Metapod",12:"Butterfree",13:"Weedle",14:"Kakuna",15:"Beedrill",16:"Pidgey",17:"Pidgeotto",18:"Pidgeot",19:"Rattata",20:"Raticate",21:"Spearow",22:"Fearow",23:"Ekans",24:"Arbok",25:"Pikachu",26:"Raichu",27:"Sandshrew",28:"Sandslash",29:"Nidoran F",30:"Nidorina",31:"Nidoqueen",32:"Nidoran M",33:"Nidorino",34:"Nidoking",35:"Clefairy",36:"Clefable",37:"Vulpix",38:"Ninetales",39:"Jigglypuff",40:"Wigglytuff",41:"Zubat",42:"Golbat",43:"Oddish",44:"Gloom",45:"Vileplume",46:"Paras",47:"Parasect",48:"Venonat",49:"Venomoth",50:"Diglett",51:"Dugtrio",52:"Meowth",53:"Persian",54:"Psyduck",55:"Golduck",56:"Mankey",57:"Primeape",58:"Growlithe",59:"Arcanine",60:"Poliwag",61:"Poliwhirl",62:"Poliwrath",63:"Abra",64:"Kadabra",65:"Alakazam",66:"Machop",67:"Machoke",68:"Machamp",69:"Bellsprout",70:"Weepinbell",71:"Victreebel",72:"Tentacool",73:"Tentacruel",74:"Geodude",75:"Graveler",76:"Golem",77:"Ponyta",78:"Rapidash",79:"Slowpoke",80:"Slowbro",81:"Magnemite",82:"Magneton",83:"Farfetch'd",84:"Doduo",85:"Dodrio",86:"Seel",87:"Dewgong",88:"Grimer",89:"Muk",90:"Shellder",91:"Cloyster",92:"Gastly",93:"Haunter",94:"Gengar",95:"Onix",96:"Drowzee",97:"Hypno",98:"Krabby",99:"Kingler",100:"Voltorb",101:"Electrode",102:"Exeggcute",103:"Exeggutor",104:"Cubone",105:"Marowak",106:"Hitmonlee",107:"Hitmonchan",108:"Lickitung",109:"Koffing",110:"Weezing",111:"Rhyhorn",112:"Rhydon",113:"Chansey",114:"Tangela",115:"Kangaskhan",116:"Horsea",117:"Seadra",118:"Goldeen",119:"Seaking",120:"Staryu",121:"Starmie",122:"Mr. Mime",123:"Scyther",124:"Jynx",125:"Electabuzz",126:"Magmar",127:"Pinsir",128:"Tauros",129:"Magikarp",130:"Gyarados",131:"Lapras",132:"Ditto",133:"Eevee",134:"Vaporeon",135:"Jolteon",136:"Flareon",137:"Porygon",138:"Omanyte",139:"Omastar",140:"Kabuto",141:"Kabutops",142:"Aerodactyl",143:"Snorlax",144:"Articuno",145:"Zapdos",146:"Moltres",147:"Dratini",148:"Dragonair",149:"Dragonite",150:"Mewtwo",151:"Mew"},b={0:"Unknown",1:"Pokeball",2:"Greatball",3:"Ultraball",4:"Masterball",101:"Potion",102:"Super Potion",103:"Hyper Potion",104:"Max Potion",201:"Revive",202:"Max Revive",301:"Lucky Egg",401:"Incense",402:"Spicy Incense",403:"Cool Incense",404:"Floral Incense",501:"Troy Disk",602:"X Attack",603:"X Defense",604:"X Miracle",701:"Razz Berry",702:"Bluk Berry",703:"Nanab Berry",704:"Wepar Berry",705:"Pinap Berry",801:"Special Camera",901:"Incubator (Unlimited)",902:"Incubator",1001:"Pokemon Storage Upgrade",1002:"Item Storage Upgrade"},c=[{level:1,exp_to_next_level:1e3,current_level_xp:0},{level:2,exp_to_next_level:2e3,current_level_xp:1e3},{level:3,exp_to_next_level:3e3,current_level_xp:3e3},{level:4,exp_to_next_level:4e3,current_level_xp:6e3},{level:5,exp_to_next_level:5e3,current_level_xp:1e4},{level:6,exp_to_next_level:6e3,current_level_xp:15e3},{level:7,exp_to_next_level:7e3,current_level_xp:21e3},{level:8,exp_to_next_level:8e3,current_level_xp:28e3},{level:9,exp_to_next_level:9e3,current_level_xp:36e3},{level:10,exp_to_next_level:1e4,current_level_xp:45e3},{level:11,exp_to_next_level:1e4,current_level_xp:55e3},{level:12,exp_to_next_level:1e4,current_level_xp:65e3},{level:13,exp_to_next_level:1e4,current_level_xp:75e3},{level:14,exp_to_next_level:15e3,current_level_xp:85e3},{level:15,exp_to_next_level:2e4,current_level_xp:1e5},{level:16,exp_to_next_level:2e4,current_level_xp:12e4},{level:17,exp_to_next_level:2e4,current_level_xp:14e4},{level:18,exp_to_next_level:25e3,current_level_xp:16e4},{level:19,exp_to_next_level:25e3,current_level_xp:185e3},{level:20,exp_to_next_level:5e4,current_level_xp:21e4},{level:21,exp_to_next_level:75e3,current_level_xp:26e4},{level:22,exp_to_next_level:1e5,current_level_xp:335e3},{level:23,exp_to_next_level:125e3,current_level_xp:435e3},{level:24,exp_to_next_level:15e4,current_level_xp:56e4},{level:25,exp_to_next_level:19e4,current_level_xp:71e4},{level:26,exp_to_next_level:2e5,current_level_xp:9e5},{level:27,exp_to_next_level:25e4,current_level_xp:11e5},{level:28,exp_to_next_level:3e5,current_level_xp:135e4},{level:29,exp_to_next_level:35e4,current_level_xp:165e4},{level:30,exp_to_next_level:5e5,current_level_xp:2e6},{level:31,exp_to_next_level:5e5,current_level_xp:25e5},{level:32,exp_to_next_level:75e4,current_level_xp:3e6},{level:33,exp_to_next_level:1e6,current_level_xp:375e4},{level:34,exp_to_next_level:125e4,current_level_xp:475e4},{level:35,exp_to_next_level:15e5,current_level_xp:6e6},{level:36,exp_to_next_level:2e6,current_level_xp:75e5},{level:37,exp_to_next_level:25e5,current_level_xp:95e5},{level:38,exp_to_next_level:3e6,current_level_xp:12e6},{level:39,exp_to_next_level:5e6,current_level_xp:15e6},{level:40,exp_to_next_level:0,current_level_xp:2e7}];return{toThreeDigits:function(a){var b=b||"0",a=a+"";return a.length>=3?a:new Array(3-a.length+1).join(b)+a},pokemonById:function(b){return a[b]},getLevelPercent:function(a,b){return Math.round((b-c[a-1].current_level_xp)/c[a-1].exp_to_next_level*100*100)/100},pokemonData:function(){return a},getItemById:function(a){return b[a]}}}),angular.module("pokemonGoWebViewApp").controller("ItemCtrl",["$scope","$uibModalInstance","selectedBot",function(a,b,c){a.selected_bot=c,a.cancel=function(){b.dismiss("cancel")}}]),angular.module("pokemonGoWebViewApp").directive("fallbackSrc",function(){var a={link:function(a,b,c){b.bind("error",function(){angular.element(this).attr("src",c.fallbackSrc)})}};return a}),angular.module("pokemonGoWebViewApp").controller("PokebagCtrl",["$scope","$uibModalInstance","selectedBot",function(a,b,c){console.log(c),a.selected_bot=c,a.cancel=function(){b.dismiss("cancel")}}]),angular.module("pokemonGoWebViewApp").controller("PokedexCtrl",["$scope","$uibModalInstance","selectedBot","ToolService",function(a,b,c,d){a.selected_bot=c,a.num_caught=0,angular.forEach(c.pokedex,function(b){b.caught&&a.num_caught++}),a.cancel=function(){b.dismiss("cancel")},a.toThreeDigits=function(a){return d.toThreeDigits(a)},a.pokemonById=function(a){return d.pokemonById(a)}}]),angular.module("pokemonGoWebViewApp").directive("consoleOutput",[function(){return{templateUrl:"views/directives/consoleoutput.html",restrict:"A",link:function(a,b){$(b).draggable().resizable()},controller:["$scope","BotManager","EventService",function(a,b,c){a.buffer={},a.bots=b.getBots(),c.on("*",function(b,c){c.hasOwnProperty("data")&&c.data.hasOwnProperty("msg")&&(a.buffer[c.account]||(a.buffer[c.account]=[]),b=b.split(":")[0],a.buffer[c.account].push({msg:c.data.msg,time:new Date,event:b}),a.buffer[c.account]=a.buffer[c.account].slice(Math.max(a.buffer.length-100,1)))})}]}}]),angular.module("pokemonGoWebViewApp").directive("autoScroll",function(){return{restrict:"A",scope:{autoScroll:"="},link:function(a,b,c){a.$watch("autoScroll",function(){for(var a=0;a<$(".console .output").length;a++)$(".console .output")[a].scrollTop=$(".console .output")[a].scrollHeight})}}}),angular.module("pokemonGoWebViewApp").run(["$templateCache",function(a){a.put("views/directives/consoleoutput.html",'<div id="" class="console"> <uib-tabset active="active"> <uib-tab index="$index + 1" ng-repeat="bot in bots " heading="{{bot.name}}"> <div class="output" auto-scroll="buffer[bot.name]"> <div ng-repeat="(key, line) in buffer[bot.name] track by $index" class="event-{{line.event}}"> [{{line.time | date:\'H:m:s\'}}] {{line.msg}} </div> </div> </uib-tab> </uib-tabset> </div>'),a.put("views/map.html",'<div ng-controller="MapCtrl"> <ng-map auto-size-container center="{{ map_center }}" zoom="{{ zoom }}"> <span ng-repeat="bot in bots" ng-if="bot.shown_on_map"> <custom-marker position="[{{bot.position[0]}}, {{bot.position[1]}}]"> <div class="trainer_marker" ng-style="{\'border-color\': bot.color }"> <div class="inner"> {{bot.name }}</div> </div> <div class="triangle" ng-style="\n                {\'border-color\': bot.color +\' transparent\'}"> </div> </custom-marker> <shape name="polyline" path="{{bot.location_history}}" geodesic="true" stroke-color="{{bot.color}}" stroke-opacity="1.0" stroke-weight="2"> </shape> </span> <custom-marker ng-repeat="pokemon in map_pokemons" position="{{pokemon.position}}"> <div> <img src="images/pokemon/{{pokemon.id}}.png"> </div> </custom-marker> </ng-map> </div> <div console-output class="map_console"> </div>'),a.put("views/modals/Item.html",'<div class="modal-header"> <h3 class="modal-title">Showing inventory from {{selected_bot.name}}</h3> </div> <div class="modal-body"> Max items: {{selected_bot.max_item_storage}} <div class="item_container"> <div class="item" ng-repeat="item in selected_bot.inventory track by $index" ng-if="item.count"> <img ng-src="./images/items/{{item.item_id}}.png" fallback-src="\'./items/items/0.png\'"> <span> <span class="title">{{item.name}}</span> <span class="count">{{item.count}}</span> </span> </div> </div> </div> <div class="modal-footer"> <button class="btn btn-info" type="button" ng-click="cancel()">Close</button> </div>'),a.put("views/modals/Pokebag.html",'<div class="modal-header"> <h3 class="modal-title">Showing Pokebag from {{selected_bot.name}}</h3> </div> <div class="modal-body"> {{ selected_bot.pokemons.length }} / {{selected_bot.max_pokemon_storage}} <div class="pokemon_container"> <div class="col-xs-2" ng-repeat="pokemon in selected_bot.pokemons track by $index"> <img ng-src="./images/pokemon/{{pokemon.pid}}.png" fallback-src="\'./items/items/0.png\'">  <div class="pokemon_stats"> <div class="name">{{pokemon.name}}</div> <div class="cp">CP {{pokemon.cp}}</div> <div class="iv">IV {{pokemon.iv}}</div> </div> </div> </div> </div> <div class="modal-footer"> <button class="btn btn-info" type="button" ng-click="cancel()">Close</button> </div>'),a.put("views/modals/Pokedex.html",'<div class="modal-header"> <h3 class="modal-title">Showing Pokedex from {{selected_bot.name}}</h3> </div> <div class="modal-body"> {{num_caught}} / {{selected_bot.pokedex.length}} <div class="pokemon_container"> <div class="col-xs-2 pokemon" ng-repeat="(key, pokemon) in selected_bot.pokedex track by $index" ng-if="key != 0"> <img ng-src="./images/pokemon/{{ toThreeDigits(key)}}.png" ng-class="{\'greyscale\': !pokemon.caught}" uib-tooltip="{{ pokemonById(key) }}"> </div> </div> </div> <div class="modal-footer"> <button class="btn btn-info" type="button" ng-click="cancel()">Close</button> </div>'),a.put("views/sidebar.html",'<div ng-controller="MenuCtrl"> <ul class="nav navbar-nav side-nav side_menu" id="sidemenu" uib-accordion> <li ng-style="{\'border-color\': bot.color}" is-open="status.isCustomHeaderOpen" class="menu_row" ng-repeat="bot in bots"> <div uib-accordion-group> <uib-accordion-heading> {{bot.name}} <i class="pull-right glyphicon" ng-class="{\'glyphicon-chevron-down\': status.isCustomHeaderOpen, \'glyphicon-chevron-right\': !status.isCustomHeaderOpen}"></i> </uib-accordion-heading> <span>Level: {{bot.player_stats.level}}</span> <span>Exp: {{bot.player_stats.experience}}</span> <div class="stat_pane"> <button class="btn btn-xs btn-small" ng-click="findBot(bot)" ng-disabled="!bot.position">Go to </button> <button class="btn btn-xs btn-small" ng-click="followBot(bot)" ng-disabled="!bot.position" ng-class="{\'btn-success\': bot.follow_on_map}">Follow </button> <div class="inventory_btns"> <button class="btn btn-xs btn-small" ng-click="popup(bot, \'Item\')">Items</button> <button class="btn btn-xs btn-small" ng-click="popup(bot, \'Pokebag\')">Pokebag</button> <button class="btn btn-xs btn-small" ng-click="popup(bot, \'Pokedex\')">Pokedex</button> </div> </div> <div class="progress_container"> <div class="progress"> <div class="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="width: {{ getLevelPercent(bot.player_stats.level ,bot.player_stats.experience ) }}%"> <span>{{ getLevelPercent(bot.player_stats.level ,bot.player_stats.experience ) }}%</span> </div> </div> </div> </div> </li> </ul> <script type="text/ng-template" id="myModalContent.html"><div class="modal-header">\n            <h3 class="modal-title">I\'m a modal!</h3>\n        </div>\n        <div class="modal-body">\n            <ul>\n                <li ng-repeat="item in items">\n                    <a href="#" ng-click="$event.preventDefault(); selected.item = item">{{ item }}</a>\n                </li>\n            </ul>\n            Selected: <b>{{ selected.item }}</b>\n        </div>\n        <div class="modal-footer">\n            <button class="btn btn-primary" type="button" ng-click="ok()">OK</button>\n            <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>\n        </div></script> </div>')}]);