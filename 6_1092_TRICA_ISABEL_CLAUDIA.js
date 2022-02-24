//Afisarea valorii alese de un control
function controlChange(label,text,value){
    document.getElementById(label).innerText=text+": "+value;
}
//Declarare variabile globale
//Coduri taste
var MOUSE_LEFT=0, MOUSE_RIGHT=2, KEY_DEL=46, ESCAPE=27;
var x1=0,y1=0;
var elementSelectat=null;
var elementDrag=null;
var mouseX=0;
var mouseY=0;
var offsetX=0;
var offsetY=0;
var attributes={};
var editorHistory=[];

var customString="";
var customPath=null;
var pathElement=null;
var customPoint=[];

var editor=document.getElementById("editor");
var elemente=document.getElementById("elemente");
var coords=document.getElementById("coords");
var drawBtn=document.getElementById("draw-btn");
var editBtn=document.getElementById("edit-btn");
var pathPoints=document.querySelectorAll(".pathPoint");
//Atribute ale formei desenate
var style={
    forma:"none",
    fill:"none",
    stroke:"none",
    strokeWidth:3,
    colorIndex:12
}
//Actualizarea valorilor pozitiei mousului in variabilele mouseX, mouseY
let updateMouseCoords=function(e){
    mouseX=parseInt(e.pageX-editor.getBoundingClientRect().left);
    mouseY=parseInt(e.pageY-editor.getBoundingClientRect().top);
	coords.innerText=`x:${mouseX};\ty:${mouseY}`;    
}
editor.addEventListener("mousemove",updateMouseCoords);
//seatrea atributelor style obiectului svg
function setareStilObiect(obiect){
    obiect.setAttributeNS(null,'stroke',style.stroke);
    obiect.setAttributeNS(null,'stroke-width',style.strokeWidth);
    obiect.setAttributeNS(null,'fill',style.fill);
    localStorage.setItem("svg",elemente.innerHTML);
}
//setare coordonate pozitie pentru element svg rect
function setareCoordonateDreptunghi(obiect,x1,y1,x2,y2)
{
	obiect.setAttributeNS(null,'x',Math.min(x1,x2));
	obiect.setAttributeNS(null,'y',Math.min(y1,y2));
	obiect.setAttributeNS(null,'width',Math.max(x1,x2)-Math.min(x1,x2));
	obiect.setAttributeNS(null,'height',Math.max(y1,y2)-Math.min(y1,y2));   
}
//setare coordonate pozitie pentru element svg polygon
function setareCoordonateRomb(obiect,x1,y1,x2,y2){
    let p1x=Math.min(x1,x2);
    let p1y=Math.min(y1,y2);
    let p2x=Math.max(x1,x2);
    let p2y=Math.max(y1,y2);
    let puncte=`${(p1x+p2x)/2},${p1y} ${p1x},${(p1y+p2y)/2} ${(p1x+p2x)/2},${p2y} ${p2x},${(p1y+p2y)/2}`;
    obiect.setAttributeNS(null,'points',puncte);
}
//setare coordonate pozitie pentru element svg ellipse
function setareCoordonateElipsa(obiect,x1,y1,x2,y2)
{
    let rx=(Math.max(x2,x1)-Math.min(x1,x2))/2;
    let ry=(Math.max(y2,y1)-Math.min(y1,y2))/2;
    obiect.setAttributeNS(null,'cx',Math.min(x1,x2)+rx);
	obiect.setAttributeNS(null,'cy',Math.min(y1,y2)+ry);
	obiect.setAttributeNS(null,'rx',rx);
	obiect.setAttributeNS(null,'ry',ry);
}
//setare coordonate pozitie pentru element svg line
function setareCoordonateLinie(obiect,x1,y1,x2,y2){
    obiect.setAttributeNS(null,'x1',x1);
	obiect.setAttributeNS(null,'y1',y1);
    obiect.setAttributeNS(null,'x2',x2);
	obiect.setAttributeNS(null,'y2',y2);
    obiect.setAttributeNS(null,'stroke',style.stroke);
    obiect.setAttributeNS(null,"stroke-width",style.strokeWidth);
}
//creare si initializare element svg de selectie
let handlerStartDraw=function startDraw(e){
    var selectieRect=document.getElementById("selectieRect");
    var selectieElipsa=document.getElementById("selectieElipsa");
    var selectieLinie=document.getElementById("selectieLinie");
    var selectieRomb=document.getElementById("selectieRomb");
	if (e.button==MOUSE_LEFT)
	{   
        x1=e.pageX-editor.getBoundingClientRect().left;
		y1=e.pageY-editor.getBoundingClientRect().top;
        switch(style.forma){
            case "rect":
                setareCoordonateDreptunghi(selectieRect,x1,y1,x1,y1);
                selectieRect.style.display="block";
                setareStilObiect(selectieRect);
                break;
            case 'elipsa':
                setareCoordonateElipsa(selectieElipsa,x1,y1,x1,y1);
                selectieElipsa.style.display="block";
                setareStilObiect(selectieElipsa);
                break;
            case "line":
                setareCoordonateLinie(selectieLinie,x1,y1,x1,y1);
                selectieLinie.style.display="block";
                break;
            case "romb":
                setareCoordonateRomb(selectieRomb,x1,y1,x1,y1);
                selectieRomb.style.display="block";
                setareStilObiect(selectieRomb);
                break;
        }			 
	}
}
//setare stil coordonate element de selectie
let handlerDraw=function draw(e)
{
    switch(style.forma){
        case "rect": setareCoordonateDreptunghi(selectieRect,x1,y1,mouseX,mouseY);
        case "elipsa": setareCoordonateElipsa(selectieElipsa,x1,y1,mouseX,mouseY);
        case "line": setareCoordonateLinie(selectieLinie,x1,y1,mouseX,mouseY);
        case "romb": setareCoordonateRomb(selectieRomb,x1,y1,mouseX,mouseY);

    }	
}
//la ridicarea clickului se desenaza elementul definitiv, se sterge elemenul de selectie
//se adauga in storage forma obtinuta
let handlerEndDraw=function endDraw(e)
{
	if (e.button==MOUSE_LEFT)
    {       
        x2=e.pageX-editor.getBoundingClientRect().left;
		y2=e.pageY-editor.getBoundingClientRect().top;
        let elementnou=null;
        switch(style.forma){
            case "rect":
                selectieRect.style.display="none";
                elementnou=document.createElementNS("http://www.w3.org/2000/svg","rect");
                setareCoordonateDreptunghi(elementnou,x1,y1,x2,y2);
                setareStilObiect(elementnou);
                break;
            case "elipsa":
                selectieElipsa.style.display="none";
                elementnou=document.createElementNS("http://www.w3.org/2000/svg","ellipse");
                setareCoordonateElipsa(elementnou,x1,y1,x2,y2);
                setareStilObiect(elementnou);
                break;
            case "line":
                 selectieLinie.style.display="none";
                 elementnou=document.createElementNS("http://www.w3.org/2000/svg","line");
                 setareCoordonateLinie(elementnou,x1,y1,x2,y2);
                 break;
            case "romb":
                 selectieRomb.style.display="none";
                 elementnou=document.createElementNS("http://www.w3.org/2000/svg","polygon");
                 setareCoordonateRomb(elementnou,x1,y1,x2,y2);
                 setareStilObiect(elementnou);
                 break;

        }
        if(elementnou!=null) elemente.appendChild(elementnou);
        let content=document.getElementById("elemente");
        editorHistory.push(content.innerHTML);
        localStorage.setItem("svg",elemente.innerHTML);
	}
    
}

editor.addEventListener("mousedown",handlerStartDraw);
editor.addEventListener("mousemove",handlerDraw);
editor.addEventListener("mouseup",handlerEndDraw);

//Actualizarea stringului de puncte eferente unui element path
function addPointsString(coord1,coord2){
    customPoint.push([coord1,coord2]);
    if(customPoint.length>1){
        customString+=" L"+coord1+" "+coord2;
    }
    else if(customPoint.length===1){
        customString+="M"+coord1+" "+coord2;
    }
}
//creare puncte de definire a unui element path
let addPoints=function(e){
    if(style.forma==="path"){
        let elementnou=document.createElementNS("http://www.w3.org/2000/svg","circle");
        elementnou.setAttributeNS(null,'fill',"red");
        elementnou.setAttributeNS(null,'r','5');
        elementnou.setAttributeNS(null,'cx',mouseX);
        elementnou.setAttributeNS(null,'cy',mouseY);
        elementnou.classList.add("pathPoint");
        elemente.appendChild(elementnou);
        addPointsString(mouseX,mouseY);
        customPath.setAttributeNS(null,'d',customString);
        setareStilObiect(customPath);      
    }    
}
//activare/dezactivare functii de desenare la evenimentele mouse-ului
function enableDraw(enable){
    if(enable){
        editor.addEventListener("mousedown",handlerStartDraw);
        editor.addEventListener("mousemove",handlerDraw);
        editor.addEventListener("mouseup",handlerEndDraw);
    }
    else{
        editor.removeEventListener("mousedown",handlerStartDraw);
        editor.removeEventListener("mousemove",handlerDraw);
        editor.removeEventListener("mouseup",handlerEndDraw);
    }
}
//activare/dezactivare functii de drag la evenimentele mouse-ului
function enableDrag(enable){
    if(enable){
        elemente.addEventListener("mousedown",handlerStartDrag);
        elemente.addEventListener("mousemove",handlerDrag);
        elemente.addEventListener("mouseup",handlerEndDrag);
    }
    else{
        elemente.removeEventListener("mousedown",handlerStartDrag);
        elemente.removeEventListener("mousemove",handlerDrag);
        elemente.removeEventListener("mouseup",handlerEndDrag);
    }
}
//adaugarea unui nou input sectiunii de setare a coordonatelor formei selectate
//utilizatorul are posibilitatea de a schimba coordonatele formei path la schimbarea inputurilor
function createInput(name,value){
    let label=document.createElement('label');
    label.setAttribute('for',name);
    label.innerText=`${name}:`;

    let input=document.createElement('input');
    input.setAttribute('name',name); 
    input.setAttribute('value',value);

    let section=document.getElementById("shape-coords");
    if(elementSelectat.tagName=="path"){
        input.addEventListener('change',function(){
        if(this.value!="" && elementSelectat){
            let inputs=document.querySelectorAll("#shape-coords input");
            customString="";
            customPoint=[];
            for(i=0;i<inputs.length-1;i+=2)
                addPointsString(inputs[i].value,inputs[i+1].getAttribute('value'));
            customString+=" Z";
            elementSelectat.setAttributeNS(null,'d',customString);
        }});
    }
    
    section.appendChild(label);
    section.appendChild(input);
}
//spargerea unui input in mai multe inputuri pentru proprietatile de tip d si points (care au mai multe valori)
function generateInput(property){
    property.forEach(p=>{
        if(p=="d"){
            let coords=elementSelectat.getAttribute("d").split(" ");
            for(i=0;i<coords.length-1;i+=2){
                let x=coords[i].substring(1);
                let y=coords[i+1];
                createInput(`px${i/2}`,x);
                createInput(`py${i/2}`,y);
            }
        }
        else if(p=="points"){
            let coords=elementSelectat.getAttribute("points").split(" ");
            console.log(coords);
            for(i=0;i<coords.length;i++){
                let x=coords[i].split(",")[0];
                let y=coords[i].split(",")[1];
                createInput(`px${i*2}`,x);
                createInput(`py${i*2+1}`,y);
            }
        }
        else createInput(p,elementSelectat.getAttribute(p));
    });
}
//se genereaza un tip de input in functie de tipul formei
function addShapeCoords(){
    document.getElementById("shape-coords").innerHTML="";
    switch(elementSelectat.tagName){
        case "ellipse":
            generateInput(["cx","cy","rx","ry"]);
            break;
        case "rect":
            generateInput(["width","height","x","y"]);
            break;
        case "line":
            generateInput(["x1","y1","x2","y2"]);
            break;
        case "polygon":
            generateInput(["points"]);
            break;
        case "path":
            generateInput(["d"]);
            break;
    }
}
//functie care face switch intre modul editare si modul desenare cand se apasa pe editor
//daca se apasa pe o forma, este permisa editarea formei si functia de drag
//daca se apasa inafara formei, este permisa desenarea
editor.onclick=function(e){
    let elemente=document.getElementById("elemente");
    let elementeCopii=document.querySelectorAll("#elemente *");
    if(elemente!==e.target && elemente.contains(e.target))//click pe unul din elemente
    {        
        elementeCopii.forEach(el=>el.classList.remove("selectat"));
        elementSelectat=e.target;
        elementSelectat.classList="selectat";
        enableDraw(false);
        enableDrag(true);  
        addShapeCoords(); 
    }
    else{//click inafara elementelor
        elementSelectat=null;
        elementeCopii.forEach(el=>el.classList.remove("selectat"));
        enableDraw(true);
        enableDrag(false);        
    }
}
//se trateaza evenimentele tastaturii
document.onkeydown=function(e)
{
	//la delete se sterge forma selectata
    if (elementSelectat&&e.keyCode==KEY_DEL){
        elementSelectat.remove();
        localStorage.setItem("svg",elemente.innerHTML);
    } 
    //la escape se deseneaza path-ul in functie de punctele adaugate pana in acel moment
    if(e.keyCode==ESCAPE){
        customPath.setAttributeNS(null,'d',customString+" Z");
        var elements = document.getElementsByClassName("pathPoint");
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
        customString="";
        customPoint=[];
        editor.removeEventListener("click",addPoints);
    }
    //la Ctrl si Z apasate simultan se revine la ultima varianta de editor salvata in editHistory
    if (event.ctrlKey && event.key === 'z') {
        editorHistory.pop();
        let lastVersion=editorHistory.at(-1);
        document.getElementById("elemente").innerHTML=lastVersion;
        console.log(lastVersion);
        localStorage.setItem("svg",elemente.innerHTML);
    }
}

//evenimentul de start drag - se initializeaza elementul si pozitia unde s-a facut click pe forma
let handlerStartDrag=function(e){
    elementDrag=e.target;
    offsetX = mouseX;
    offsetY = mouseY;
}

//evenimentul de drag - se face translate la forma careia ii facem drag
let handlerDrag=function(e){
    if (elementDrag) {
        e.preventDefault();
        elementDrag.setAttributeNS(null,'transform',`translate(${mouseX-offsetX} ${mouseY-offsetY})`);
    }
}
//variabila revine pe null
let handlerEndDrag=function(e){
    elementDrag = null;
}
//se actualizeaza stilul paletei la alegerea unei noi culori
function addColorPallette(color){
    if(style.colorIndex==0) style[colorIndex]=12;
    document.getElementById(`c${style.colorIndex}`).style.fill=color;
    style.colorIndex--;
}
//la alegerea unei forme de deseneat se actualizeaza variabila forma
//daca este vorba de un path, la click pe editor se realizeaza functia de adaugare a punctelor
document.getElementById("tools").onclick=function(){
    style.forma = document.querySelector("#tools option:checked").value;
    if(style.forma==="path"){
        customPath=document.createElementNS("http://www.w3.org/2000/svg","path");
        elemente.appendChild(customPath);
        editor.addEventListener("click",addPoints);
    }
        
}
//functii care urmaresc schimbarea unui control ce indica culoarea de fill, de stroke, grosimea stroke-ului
//la schimbarea valorii unui control daca o forma este selectata, se actualizeaza stilul formei cu noua valoare
document.getElementById("fill").onchange=function(){
    style.fill=document.getElementById("fill").value;
    addColorPallette(style.fill);  
    if(elementSelectat) 
        setareStilObiect(elementSelectat);
}

document.getElementById("stroke").onchange=function(){
    style.stroke=document.getElementById("stroke").value;
    addColorPallette(style.stroke);
    if(elementSelectat) setareStilObiect(elementSelectat);
}

document.getElementById("stroke-slider").onchange=function(){
    style.strokeWidth=document.getElementById("stroke-slider").value;
    if(elementSelectat) setareStilObiect(elementSelectat);
}
//functie de descarcare
//creeaza un element link care are ca proprietate download continutul de descarcat
//functia apoi realizeaza click pe linkul creat
function download(href, name)
{
    var linkDescarcare = document.createElement('a');
    linkDescarcare.href = href;
    linkDescarcare.download = name;
    document.body.appendChild(linkDescarcare);
    linkDescarcare.click();
    document.body.removeChild(linkDescarcare);
}
//conversie din elementul svg in Blob
//crearea unui url cu adresa obiectului svg
function svgToURL(){
    var svgString = new XMLSerializer().serializeToString(editor);
    var DOMURL = self.URL || self.webkitURL || self;
    
    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    var url = DOMURL.createObjectURL(svg);
    return url;
}
//functie activata de apasarea butonului de save png
//se creeaza un element canvas pe care desenam o imagine a obiectului svg care se descarca
document.getElementById("save-png").onclick=function(){
    //creare canvas
    let canvas = document.createElement('canvas'); 
    canvas.width = editor.clientWidth;
    canvas.height = editor.clientHeight;
    var ctx = canvas.getContext("2d");
    //creare imagine
    let img = new Image();
    let url=svgToURL();
    img.onload = function() {
        //desenare imagine pe canvas
        ctx.drawImage(img, 0, 0,editor.clientWidth,editor.clientHeight);
        var png = canvas.toDataURL("image/png");
        download(png, 'image.png');
    };
    img.src = url;
}

//functie activata de apasarea butonului de save svg
//se descarca varianta vizuala a elementului svg
document.getElementById("save-svg").onclick=function(){
    download(svgToURL(),"image.svg");
}

elemente.innerHTML=localStorage.getItem("svg");






