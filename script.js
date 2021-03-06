// ==UserScript==
// @name       TravianScripts
// @author z-z
// @description Предоставляет всякие вспомогательные функции, типа ResourceBar
// @version 1.0.3
// @grant none
// @include http://*.travian.*
// @exclude *gettertools*
// @exclude *tactics*
// @exclude *ks4*
// ==/UserScript==




/*********************/
/**** BLOCK START ****/
/*********************/

// этот блок работает на странице постройки
// ресурсы, которых не хватает для следующего уровня, красит красным цветом
// а также в скобках дописыват, сколько времени осталось для накопления каждого ресурса и сколько ресурсов осталось накопить

$$('.little_res').setStyle('color', 'red').each(function(el){
    var cl = el.get('class');
    cl = cl.split(" ");
    var resID = cl[1].replace('r', 'l');
    var needed = parseInt(el.get("text"));
    var curr = parseInt(($(resID).get("text")).replace('.', ''));
    
    var time = needed - curr;
    var prod = resources.production['l'+(el.getParent().getChildren('.resources').indexOf(el)+1)];
    console.log(prod);
    time = time / prod * 3600;
    
    el.set('html', '<img class="r'+(el.getParent().getChildren('.resources').indexOf(el)+1)+'" src="img/x.gif">' + needed + ' <font color="#99C01A">(' + (curr-needed) + ' - '+toTime(time)+')</font>');
});

/*******************/
/**** BLOCK END ****/
/*******************/




/*********************/
/**** BLOCK START ****/
/*********************/


// далее идет большой блок, который выводит "виджет" "ЧВР аккаунта"
// этот виджет использует localStorage для хранения данных
// он запоминает ЧВР во всех деревнях, которые посещал пользователь
// и выводит суммарный результат в левую панель под блоком героя
// данные обновляются каджый раз, когда пользователь переходит по деревням
// то есть если пользователь давно не заходил в деревню Х, то ее данные возможно будут не актуальны

var villageId   = parseInt((($$('#sidebarBoxVillagelist a.active').get('href'))[0].split('='))[1]);
var villageName = $$('#sidebarBoxVillagelist a.active').getChildren('.name')[0].get('html')[0];
var villageProd = resources.production;

var gameNik = ($$('.playerName').get('text')[0]).substr(1);
var storageName = 'resStor_' + gameNik + '_' + Travian.Game.worldId + '_x' + Travian.Game.speed;

// если нет хранилища, сохраняем сразу с данными текущей деревни
if(localStorage.getItem(storageName) == null) localStorage.setItem(storageName, JSON.encode(getStorageConstructor(villageId, villageProd, villageName)))
else{
	var tempStor = JSON.decode(localStorage.getItem(storageName));
    tempStor.villages[villageId] = villageProd;
    
    tempStor.sum = {};
    
    for(var i in tempStor.villages){
        for(var j = 1; j <= 5; j++){
            if(!tempStor.sum['l'+j]) tempStor.sum['l'+j] = 0;
            tempStor.sum['l'+j] += tempStor.villages[i]['l'+j];
        }
    }
    
    tempStor.all = tempStor.sum.l1 + tempStor.sum.l2 + tempStor.sum.l3 + tempStor.sum.l5;
    
    if(!tempStor.names[villageId]) tempStor.names[villageId] = villageName;
    
    $$('#sidebarBoxVillagelist li > a').each(function(el){
    	var newId   = parseInt(((el.get('href')).split('='))[1]);
		var newName = el.getChildren('.name')[0].get('html');
        if(tempStor.names[newId] && tempStor.names[newId] != newName) tempStor.names[newId] = newName;
    });
    
    localStorage.setItem(storageName, JSON.encode(tempStor));
}


var dat = JSON.decode(localStorage.getItem(storageName));

var dorfs = '';
for(var z in dat.names) dorfs += "<b>" + dat.names[z] + "</b>&nbsp;&nbsp;";

var htm = '<div id="resBox" class="sidebarBox toggleable"> <div class="sidebarBoxBaseBox"> <div class="baseBox baseBoxTop"> <div class="baseBox baseBoxBottom"> \
<div class="baseBox baseBoxCenter"></div></div></div></div><div class="sidebarBoxInnerBox"> <div class="innerBox header ">\
<br><div class="boxTitle">ЧВР аккаунта</div></div><div class="innerBox content"><ul>\
<li><img class="r1Big" src="img/x.gif" alt="">&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;'+dat.sum.l1+'</li>\
<li><img class="r2Big" src="img/x.gif" alt="">&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;'+dat.sum.l2+'</li>\
<li><img class="r3Big" src="img/x.gif" alt="">&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;'+dat.sum.l3+'</li>\
<li><img class="r4Big" src="img/x.gif" alt="">&nbsp;&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;'+dat.sum.l4+'</li>\
<li>&nbsp;</li><li><b>Всего:&nbsp;&nbsp;&nbsp;'+dat.all+'</b></li><li>&nbsp;</li><li>Учтены деревни:</li>\
<li>'+dorfs+'</li></ul> </div><div class="innerBox footer"><button type="button" class="toggle" onclick=""><div class="button-container addHoverClick "></div></button> </div></div></div>';


if(dat.show){
    var el = Elements.from(htm);
    el[0].inject($('sidebarBoxHero'), 'after');
}



$('resBox').down('button.toggle').addEvent('click', function(){ Travian.Game.Layout.toggleBox($('resBox'), 'travian_toggle', 'res'); });

function getStorageConstructor(id, obj, name){
    var a = {
        villages: {},
        sum: obj,
        all: 0,
        show: true,
        names: {}
    };
    a.villages[id] = obj;
    a.all = obj.l1 + obj.l2 + obj.l3 + obj.l5;
    
    a.names[id] = name;
    
    return a;
}

function toTime(t){
    var sec_num = parseInt(t, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    var time    = hours+' ч. '+minutes+' мин. '+seconds + ' сек.';
    return time;
}


/*******************/
/**** BLOCK END ****/
/*******************/






/*********************/
/**** BLOCK START ****/
/*********************/


// этот блок вставляет ссылки на отправку ресурсов и войск для каждой деревни в списке деревень

var gpackNum = ((/gpack.travian.com\/(\d+)/gmi).exec(document.documentElement.outerHTML))[1];
    
var resImg = new Element('img', {
    class: 'reportInfo carry full',
    src: 'img/x.gif',
    styles: {
        width: '13px',
        height: '12px',
        position: 'relative',
        background: 'url(http://gpack.travian.com/'+gpackNum+'/img/a/carry.gif)',
        top: '2px',
        left: 0
    }
});

var resLink = new Element('a', {
    href: '#',
    styles: {
        position: 'absolute',
        width: 'auto',
        height: 'auto',
        padding: 0,
        margin: 0,
        top: "0px",
        left: '150px'
    }
});

resImg.inject(resLink);




var defImg = new Element('img', {
    class: 'def2',
    src: 'img/x.gif',
    styles: {
        width: '16px',
        height: '16px',
        position: 'relative',
        'background': 'url(http://gpack.travian.com/'+gpackNum+'/img/a/def2.gif)',
        top: 0,
        left: 0
    }
});

var defLink = new Element('a', {
    href: '#',
    styles: {
        position: 'absolute',
        width: 'auto',
        height: 'auto',
        padding: 0,
        margin: 0,
        top: "0px",
        left: '130px'
    }
});

defImg.inject(defLink);



$$('#sidebarBoxVillagelist li').each(function(el){
    if(!el.hasClass('active')){
        var vid = el.getElement('span').get('html');
        var rLink = "build.php?gid=17&t=5&z=" + getVidFromCoords(vid);
        var dLink = "build.php?gid=16&tt=2&z=" + getVidFromCoords(vid);
        resLink.clone().set('href', rLink).inject(el);
        defLink.clone().set('href', dLink).inject(el);
    }
});



function xy2id(x, y) {
    return (1 + (parseInt(x) + 400) + (801 * Math.abs(parseInt(y) - 400)));
}    
    

function getVidFromCoords ( txt ) {
    var xy = new Array;
    if( /coordinateX/.test(txt) ) {
        txt = txt.replace(/([\u2000-\u20ff])/g,'');
        xy[1] = txt.match(/coordinateX.+?(-?\d{1,3})/)[1];
        xy[2] = txt.match(/coordinateY.+?(-?\d{1,3})/)[1];
    } else
        xy = txt.match(/\((-?\d{1,3})\D+?(-?\d{1,3})\)/);
    return xy ? xy2id(xy[1],xy[2]): -1;
}


/*******************/
/**** BLOCK END ****/
/*******************/





/*********************/
/**** BLOCK START ****/
/*********************/


// эта строка отмечает новые сообщения и новые отчеты галочками, чтобы просто можно было нажать "удалить" сразу

$$('#overview tr').each(function(el){ if(el.getChildren()[1].hasClass('newMessage')) el.getChildren()[0].getChildren()[0].checked = true; });



/*******************/
/**** BLOCK END ****/
/*******************/







/*********************/
/**** BLOCK START ****/
/*********************/


// этот блок работает на странице рынка во вкладке "Отправить"
// скрипт смотрит исходящих и входящих торговцев, подсчитывает суммарное количество входящих и исходящих ресурсов
// и вставляет на страницу данные в виде таблиц 


if ( $('merchantsOnTheWay') ) {
    
    var $block = $('merchantsOnTheWay');
    var traders = [];
    
    if ( $block.getChildren('h4').length == 1 ) {
        traders = [$block.getChildren('.traders')];
    } else {
        var arr = [];
        $block.getChildren().forEach( function(item, i, arr) {
            if ( item.tagName == "H4" ) {
                traders.push([]);
            } else {
                traders[traders.length-1].push(item);
            }
        } );
    }
    
    traders.forEach(function( item, i, arr ){
        var h4 = $block.getChildren('h4')[i];
        var r1 = 0, r2 = 0, r3 = 0, r4 = 0;
        if(!Array.isArray(item)) item = [item];
        item.forEach(function(item1, i1, arr1){
            var res = item1.getElements("tr.res")[0].getElements('td')[0].getChildren('span')[0];
            if(!res.hasClass('none')) {
                res = res.innerHTML.replace(/<div[^>]*>.*<\/div>/gi, "").replace(/<img[^>]*>/gi, "|").replace(/<[^>]*>|[\n\r\t\s]/gi, "").slice(1).split('|');
                r1 += parseInt(res[0]);
                r2 += parseInt(res[1]);
                r3 += parseInt(res[2]);
                r4 += parseInt(res[3]);
            }
        });
        
        var resStr = '<img class="r1" src="img/x.gif" alt="">' + r1 + '<img class="r2" src="img/x.gif" alt="">' + r2 + '<img class="r3" src="img/x.gif" alt="">' + r3 + '<img class="r4" src="img/x.gif" alt="">' + r4;
        var table = '<table class="traders" cellpadding=1 cellspacing=1><tr class="res"><th>Всего</th><td colspan=2><span>' + resStr + '</span></td></tr></table>';
        
        var $t = Elements.from(table)[0];
        $t.inject(h4, 'after');
    });
    
}



/*******************/
/**** BLOCK END ****/
/*******************/
