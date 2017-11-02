window.fs = require('../../js/interface/fileManager.js');
const path = require('path');
const {remote} = require('electron')
const {Menu, MenuItem} = remote

const FILE_TYPE_TXT = 0; //文件类型：txt文件
const FILE_TYPE_DIR = 1;  //文件类型：子目录

fs.createFile('test', 4);
drawAFatTable();
drawAOpenFileTable();
setWinCurrentPath('/');
showDirView('/');

function setWinCurrentPath(path) {
    let pathviw = document.getElementById('path');
    pathviw.innerText = path;
    fs.setCurrentPath(path);
}

function getWinCurrentPath() {
    return document.getElementById('path').innerText;
}

function showDirView(dir) {
    let content = document.getElementById('file-system').getElementsByClassName('content')[0];
    content.innerHTML = '';
    let ary = fs.ls(dir);
    for (let i = 0 ; i < ary.length ; ++i) {
        let article = document.createElement('article');
        article.setAttribute('title', ary[i].name);
        let img = '';
        if(ary[i].type == FILE_TYPE_DIR) {
            article.setAttribute('type', 'dir');
            img = document.createElement('img');
            img.setAttribute('src', './assets/images/file.png');
        } else {
            article.setAttribute('type', 'txt');
            img = document.createElement('img');
            img.setAttribute('src', './assets/images/TXT.png');
        }
        let p = document.createElement('p');
        p.innerText = ary[i].name;
        article.appendChild(img);
        article.appendChild(p);
        content.appendChild(article);
    }
}

//自动绘制fat表格
function drawAFatTable() {
    let blocks = fs.fat.getBlocks();
    let table = document.getElementById('fat');
    table.innerHTML = '';
    for (let i = 0 ; i < 16 ; ++i) {
        let tr = document.createElement('tr');
        for (let j = 0 ; j < 8 ; ++j) {
            let td = document.createElement('td');
            td.innerHTML= blocks[i * 8 + j];
            if (td.innerHTML != 0) {
                td.setAttribute('class', 'busy');
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

//自动绘制已打开文件表格
function drawAOpenFileTable() {
    let openfiles = fs.openfile.getAll();
    let table = document.getElementById('openfile');
    table.innerHTML = '';
    let tr = document.createElement('tr');
    tr.innerHTML = '<th>name</th><th>attr</th><th>num</th><th>flag</th>'
    table.appendChild(tr);
    for (let i = 0 ; i < openfiles.length ; ++i) {
        tr = document.createElement('tr');
        tr.innerHTML = "<td>" + openfiles[i].name + "</td>" +
        "<td>" + openfiles[i].attribute + "</td>" +
        "<td>" + openfiles[i].number + "</td>" +
        "<td>" + openfiles[i].flag + "</td>"
        table.appendChild(tr);
    }
}


var winbt = document.getElementById('winbt');
winbt.onclick = function () {
    var win_menu = document.getElementById('win-menu');
    if (win_menu.className == 'hidden') {
        win_menu.setAttribute('class', null);
        document.getElementsByClassName('warp')[0].style.display = 'block';
    } else {
        win_menu.setAttribute('class', 'hidden');
        document.getElementsByClassName('warp')[0].style.display = 'none';
    }
}

var warp = document.getElementsByClassName('warp')[0];
warp.onclick = function () {
    var win_menu = document.getElementById('win-menu');
    win_menu.setAttribute('class', 'hidden');
    this.style.display = 'none';
}

var filebt = document.getElementById('filebt');
filebt.onclick = function () {
    var fs = document.getElementById('file-system');
    if (fs.style.display == 'none') {
        fs.click();
        fs.style.display = 'block';
    } else {
        fs.style.display = 'none';
    }
}
var cmdbt = document.getElementById('cmdbt');
cmdbt.onclick = function() {
    var cmd = document.getElementById('terminal');
    if (cmd.style.display == 'none') {
        cmd.click();
        cmd.style.display = 'block';
        let inputs = cmd.getElementsByTagName('input');
        inputs[inputs.length - 1].focus();
    } else {
        cmd.style.display = 'none';
    }
}


//最小化
var minbts = document.getElementsByClassName('minbt');
for (let i = 0 ; i < minbts.length ; ++i) {
    minbts[i].onclick = function () {
        min(this.parentNode.parentNode.parentNode.parentNode)
    }
}
function min(obj) {
    // var obj = document.getElementById(id);
    if (obj.style.display == 'none') {
        obj.style.display = 'block';
    } else {
        obj.style.display = 'none';
    }
}
//最大化
var maxbts = document.getElementsByClassName('maxbt');
for (let i = 0 ; i < maxbts.length; ++i) {
    maxbts[i].onclick = function () {
        fullscreen(this.parentElement.parentElement.parentElement.parentElement);
    }
}
function fullscreen(obj) {
    if (getComputedStyle(obj)['width'] == '800px') {
        obj.style.top = "0";
        obj.style.left = "0";
        obj.style.width = "100%";
        obj.style.height = "calc(100% - 46px)";
    } else {
        obj.style.width = "800px";
        obj.style.height = "600px";
        obj.style.top = "30px";
        obj.style.left = "30px";
    }
}


//关闭
function closewindow(obj) {
    if (obj.style.display == 'none') {
        obj.style.display = 'block';
    } else {
        obj.style.display = 'none';
    }
}
var closebts = document.getElementsByClassName('closebt');
for (let i = 0 ; i < closebts.length ; ++i) {
    closebts[i].onclick = function () {
        let topNode = this.parentNode.parentNode.parentNode.parentNode;
        if (topNode.getAttribute('id') == 'edit') {
            topNode.getElementsByTagName('textarea')[0].value = '';
            closewindow(topNode);
            fs.closeFile(path.basename(document.getElementById('title').innerText));
            drawAOpenFileTable();
        } else {
            closewindow(topNode);
        }
    }
}



//拖动div
var lastX,lastY,curX,curY,minusX,minusY;
var oa = document.getElementsByClassName("window-head");
for(var i = 0 ; i < oa.length;i++){
    (function () {
        var tmp = i;
        oa[i].onmousedown = function(e){
            e.preventDefault();
            lastX = e.clientX;
            lastY = e.clientY;
            window.onmousemove = function(event){
                var e1 = event || window.event;
                curX = e1.clientX;
                curY = e1.clientY;
    
                minusX = curX - lastX;
                minusY = curY - lastY;
    
                var ob = oa[tmp].parentNode;
    
                var left = parseInt(ob.style.left);
                var top = parseInt(ob.style.top);
    
                ob.style.left = left + minusX + 'px'; 
                ob.style.top = top + minusY + 'px';
    
                lastX = curX;
                lastY = curY;
            }
            this.onmouseup = function(ev){
                window.onmousemove = null;
                this.onmouseup = null;
            }
        }
    })()
    
}

//点击某个窗口时窗口自动置顶
let windows = document.getElementsByClassName('windows');
for (let index = 0 ; index < windows.length ; ++index) {
    windows[index].onclick = function() {
        let all = document.getElementsByClassName('windows');
        let max = 0;
        for (let j = 0 ; j < all.length ; ++j) {
            max = max > getComputedStyle(all[j])['zIndex'] ? max : getComputedStyle(all[j])['zIndex'];
        }
        this.style.zIndex = parseInt(max) + 1;
        if (this.getAttribute('id') == 'terminal') {
            let inputs = this.getElementsByTagName('input');
            inputs[inputs.length - 1].focus();
        }
    }
}

//终端回车处理
var terminal = document.getElementById('terminal');
terminal.onkeydown=keyDownQuery; 
function keyDownQuery(e) {  
    // 兼容FF和IE和Opera  
    var theEvent = e || window.event;  
    var code = theEvent.keyCode || theEvent.which || theEvent.charCode;  
    if (code == 13) {   
        // console.log('enter');
        let box = document.createElement('article');
        box.innerHTML = "there's nothing" +
        "<br><br>" +
        "<span class='pc-name'>Peter@pc</span>" +
        "<span class='path'>C:/Desktop</span><br>" +
        "$&nbsp;<input class='command focus'></input>" 

        let terminal = document.getElementById('terminal'); 
        let content = terminal.getElementsByClassName('content')[0];
        content.appendChild(box);

        let inputs = terminal.getElementsByTagName('input');
        inputs[inputs.length - 2].setAttribute('disabled', 'disabled');
        terminal.onclick();

        
        return false;  
    }  
    return true;  
}

//写入文件的保存按钮
var savebt = document.getElementById('save');
savebt.onclick = function () {
    let title = path.basename(document.getElementById('title').innerText);
    let buffer = document.getElementById('edit').getElementsByTagName('textarea')[0].value;
    fs.writeFile(title, buffer, 123);
    drawAFatTable();
}

//文件或文件夹双击事件
let content = document.getElementById('file-system').getElementsByClassName('content')[0];
content.ondblclick = function (e) {
    if (e.target.parentElement.getAttribute('type') == 'dir') {
        let title = e.target.parentElement.getAttribute('title');
        let oldpath = getWinCurrentPath();
        let newpath = '';
        if (oldpath[oldpath.length - 1] == '/') {
            newpath = oldpath + title;
        } else {
            newpath = oldpath + '/' + title;
        }
        // console.log(title);
        showDirView(title);
        setWinCurrentPath(newpath);
    } else if(e.target.parentElement.getAttribute('type') == 'txt'){
        //获取文件名
        let name = e.target.parentElement.getAttribute('title');
        let path = getWinCurrentPath();
        let absoluteName = '';
        if (path[path.length - 1] == '/') {
            absoluteName = path + name;
        } else {
            absoluteName = path + '/' + name;
        }
        //获取文件内容
        let val = fs.readFile(name, 123);
        if (val === false) {
            console.log('读取文件失败');
            return;
        }
        drawAOpenFileTable();

        let editwin = document.getElementById('edit');
        document.getElementById('title').innerText = absoluteName;
        document.getElementsByTagName('textarea')[0].value = val;
        editwin.style.display = 'block';
        editwin.click();
    }
}
//文件或文件夹单击事件
content.onclick = function (e) {
    newFile();
    let arts = document.getElementById('file-system').getElementsByClassName('content')[0].getElementsByTagName('article');
    for (let i = 0 ; i < arts.length ; ++i) {
        arts[i].setAttribute('class', '');
    }
    if (e.target.parentElement.tagName == 'ARTICLE')
        e.target.parentElement.setAttribute('class', 'selected');
}


//返回上一层目录按钮
let leftbt = document.getElementById('leftbt');
leftbt.onclick = function () {
    let currentpath = getWinCurrentPath();
    if (currentpath == '/')
        return;
    let index = currentpath.lastIndexOf('/');
    let pre = currentpath.substr(0, index);
    if (pre == '')
        pre = '/';
    console.log(pre, name);
    setWinCurrentPath(pre);
    showDirView('');   
}

//进入下一层目录按钮
let rightbt = document.getElementById('rightbt');
rightbt.onclick = function () {
    let selected = document.getElementsByClassName('selected');
    if (selected.length <= 0)
        return;
    let article = selected[0];
    if (article.getAttribute('type') != 'dir')
        return;
    let currentpath = getWinCurrentPath();
    if (currentpath == '/')
        currentpath = '';
    let newpath = currentpath + '/' + article.getAttribute('title');
    setWinCurrentPath(newpath);
    showDirView('');
}

function newFile() {
    let content = document.getElementById('file-system').getElementsByClassName('content')[0];
    let files = document.getElementById('file-system').getElementsByTagName('article');
    for (let i = 0 ; i < files.length ; ++i) {
        let inputs = files[i].getElementsByTagName('input');
        if (inputs.length > 0) {
            if (inputs[0].value.length <= 0) {
                content.removeChild(files[i]);
            } else {
                switch(inputs[0].getAttribute('type')) {
                    case 'dir' :
                        fs.mkdir(inputs[0].value);
                        showDirView('');
                        drawAFatTable();
                        drawAOpenFileTable();
                        break;
                    case 'txt' :
                        fs.createFile(inputs[0].value, 4);
                        showDirView('');
                        drawAFatTable();
                        drawAOpenFileTable();
                        break;
                }
            }
        }
    }

}

/*新建文件或文件夹的菜单*/
const menuCreate = new Menu();
menuCreate.append(new MenuItem({
    label: '新建文件',
    click() {
        let content = document.getElementById('file-system').getElementsByClassName('content')[0];
        let article = document.createElement('article');
        article.setAttribute('title', 'txt');
        let img = document.createElement('img');
        img.setAttribute('src', './assets/images/txt.png');
        let p = document.createElement('input');
        p.setAttribute('type', 'txt');
        article.appendChild(img);
        article.appendChild(p);
        content.appendChild(article);
        p.focus();
    }
}));
menuCreate.append(new MenuItem({
    label: '新建文件夹',
    click() {
        let content = document.getElementById('file-system').getElementsByClassName('content')[0];
        let article = document.createElement('article');
        article.setAttribute('title', 'dir');
        let img = document.createElement('img');
        img.setAttribute('src', './assets/images/file.png');
        let p = document.createElement('input');
        p.setAttribute('type', 'dir');
        article.appendChild(img);
        article.appendChild(p);
        content.appendChild(article);
        p.focus();
    }
}));

/*文件的菜单*/
const menuFileEdit = new Menu();
menuFileEdit.append(new MenuItem({
    label: '编辑',
    click: function () {

    }
}));
menuFileEdit.append(new MenuItem({
    label: '重命名',
    click() {

    }
}));
menuFileEdit.append(new MenuItem({
    label: '删除',
    click() {

    }
}));
menuFileEdit.append(new MenuItem({
    label: '属性',
    click() {

    }
}));

//绑定右键菜单事件
const fs_content = document.getElementById('file-system').getElementsByClassName('content')[0];
fs_content.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menuCreate.popup(remote.getCurrentWindow())
}, false)

const files_menu = document.getElementById('file-system').getElementsByTagName('article');
for (let i = 0 ; i < files_menu.length ; ++i) {
    files_menu[i].addEventListener('contextmenu', (e) => {
        e.preventDefault();
        menuFileEdit.popup(remote.getCurrentWindow());
    })
}