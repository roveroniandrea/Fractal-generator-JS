let dimX = 700;
let dimY = 700;

class NumComplesso {
    constructor(reale, immaginario) {
        this.reale = reale;
        this.immaginario = immaginario;
    }
}

/*
Somma di due numeri complessi:
(a + ib) + (c + id) = (a + c) + i(b + d)
Modulo di un numero complesso (ovvero distanza di un punto del piano dall'origine degli assi):
mod(a + ib) = sqrt(a*a + b*b)
Quadrato di un numero complesso:
(a + ib)2 = (a*a - b*b) + 2abi
*/
let sommaComplessi = function (num1, num2) {
    return new NumComplesso((num1.reale + num2.reale), (num1.immaginario + num2.immaginario));
}

let moduloComplessoAlQuadrato = function (num) {
    return (num.reale * num.reale) + (num.immaginario * num.immaginario);
}
/*
let quadratoComplesso = function (num) {
    return new NumComplesso((num.reale * num.reale - num.immaginario * num.immaginario), (2 * num.reale * num.immaginario));
}
*/
let moltiplicazioneComplessi = function (n1, n2) {
    return new NumComplesso((n1.reale * n2.reale - n1.immaginario * n2.immaginario), (n1.reale * n2.immaginario + n1.immaginario * n2.reale));
}

let divisioneComplessi = function (num1, num2) {
    return new NumComplesso((num1.reale * num2.reale + num1.immaginario * num2.immaginario) / ((Math.pow(num2.reale, 2) + Math.pow(num2.immaginario, 2))), (num1.immaginario * num2.reale - num1.reale * num2.immaginario) / ((Math.pow(num2.reale, 2) + Math.pow(num2.immaginario, 2))));
}

let potenzaComplesso = function (num, esp) {
    let res = new NumComplesso();
    res = num;
    for (let i = 1; i < esp; i++) {
        res = moltiplicazioneComplessi(res, num);
    }
    return res;
}

let esponenzialeComplesso = function (num) {
    return new NumComplesso((Math.exp(num.reale) * Math.cos(num.immaginario)), (Math.exp(num.reale) * Math.sin(num.immaginario)));
}

//cos(x+iy)=cos(x)cosh(y)-isen(x)senh(y)
let cosenoComplesso = function (num) {
    return new NumComplesso(Math.cos(num.reale) * Math.cosh(num.immaginario), - Math.sin(num.reale) * Math.sinh(num.immaginario));
}

//farà il quadrato di queste operazioni?
let xMin = -1.5;
let xMax = 1.5;
let yMin = -1.5;
let yMax = 1.5;

let numMassimoDiIterazioniPerNumeroComplesso = 70;
let step = 0.01;
let zoom = 200;

let numChunks = 20;
let chunks = [];
let chunksPerSecond = 10;
let chunkAttuale = 0;


let convergeTotali = 0;
let divergeTotali = 0;
let iterazioniTotali = 0;

let mFunzioneDiMandelbrot = 2;
let cFunzioneDiMandelbrotAlDenominatore = false;
let altriFrattali = 0;

let scalaColore = 0;

//0 insieme di mandelbrot, 1 di julia
let insiemeDi = 0;
let c = new NumComplesso();
let insiemeDiJuliaC = 0;

let centroX = 0;
let centroY = 0;

window.onload = () => {
    document.querySelector('#input_mMandelbrot').addEventListener('input', e => { mFunzioneDiMandelbrot = parseFloat(e.target.value) });
    document.querySelector('#input_cMandelbrot').addEventListener('input', e => { cFunzioneDiMandelbrotAlDenominatore = e.target.checked });
    document.querySelector('#input_xMin').addEventListener('input', e => { xMin = parseFloat(e.target.value) });
    document.querySelector('#input_xMax').addEventListener('input', e => { xMax = parseFloat(e.target.value) });
    document.querySelector('#input_yMin').addEventListener('input', e => { yMin = parseFloat(e.target.value) });
    document.querySelector('#input_yMax').addEventListener('input', e => { yMax = parseFloat(e.target.value) });
    document.querySelector('#input_step').addEventListener('input', e => { step = parseFloat(e.target.value) });
    document.querySelector('#input_zoom').addEventListener('input', e => { zoom = parseFloat(e.target.value) });
    document.querySelector('#input_iterazioni').addEventListener('input', e => { numMassimoDiIterazioniPerNumeroComplesso = parseFloat(e.target.value) });
    document.querySelector('#input_numChunk').addEventListener('input', e => { numChunks = parseFloat(e.target.value) });
    document.querySelector('#input_altriFrattali').addEventListener('input', e => { altriFrattali = parseFloat(e.target.value) });
    document.querySelector('#input_scalaColore').addEventListener('input', e => { scalaColore = parseFloat(e.target.value) });
    document.querySelector('#input_insiemeDi').addEventListener('input', e => { insiemeDi = parseFloat(e.target.value) });
    document.querySelector('#input_cInsiemeDiJulia').addEventListener('input', e => { insiemeDiJuliaC = e.target.value });
}


function setup() {
    createCanvas(dimX, dimY);
    background('white');
    frameRate(chunksPerSecond);

    //console.log("somma", sommaComplessi(quadratoComplesso(new NumComplesso(1,1)), new NumComplesso(1,1)))

    //divido in chunks
    let dimChunkX = (Math.abs(xMin) + Math.abs(xMax)) / numChunks;
    dimChunkX = Math.ceil(dimChunkX / step) * step;

    for (let i = 0; i < numChunks; i++) {
        chunks[i] = {
            xI: xMin + (dimChunkX * i),
            xF: xMin + (dimChunkX * (i + 1)),
            yI: yMin,
            yF: yMax
        }
        if (chunks[i].xF > xMax) {
            chunks[i].xF = xMax;
        }
    }
    /*
    let n1 = new NumComplesso(4,3);
    let n2 = new NumComplesso(3, -2);
    let q = divisioneComplessi(n1, n2);
    console.log('divisione ',q);
    */
    //console.log(chunks);
    //console.log(cosenoComplesso(new NumComplesso(2,3)))
    noStroke();
    convergeTotali = 0;
    divergeTotali = 0;
    iterazioniTotali = 0;
    chunkAttuale = 0;

    //calcolo il centro del grafico
    centroX = (xMin + xMax) / 2;
    centroY = (yMin + yMax) / 2;
    document.querySelector('#centroGrafico').innerHTML = 'Il grafico è centrato in X: ' + centroX + " Y: " + centroY;

    //nel caso di insieme di julia c è un numero casuale fisso
    if (insiemeDi == 1) {
        if (insiemeDiJuliaC == 0 || insiemeDiJuliaC == 1) {
            let n = 0;
            if (insiemeDiJuliaC == 0)
                while (n < numMassimoDiIterazioniPerNumeroComplesso) {
                    n = 0;
                    c = new NumComplesso(Math.random() * 2 - 1, Math.random() * 2 - 1);
                    let zn = new NumComplesso(0, 0);
                    //devo controllare se il punto appartiene all'insieme di mandelbrot per ottenere un insieme di julia connesso
                    while (n < numMassimoDiIterazioniPerNumeroComplesso && moduloComplessoAlQuadrato(zn) < 4) {
                        n++;
                        if (cFunzioneDiMandelbrotAlDenominatore) {
                            zn = sommaComplessi(potenzaComplesso(zn, mFunzioneDiMandelbrot), divisioneComplessi(new NumComplesso(1, 0), c));
                        }
                        else {
                            zn = sommaComplessi(potenzaComplesso(zn, mFunzioneDiMandelbrot), c);
                        }
                    }
                }
            else {
                c = new NumComplesso(Math.random() * 2 - 1, Math.random() * 2 - 1);
            }
        }
        else {
            let cX = parseFloat(document.querySelector('#input_cJulia_x').value);
            let cY = parseFloat(document.querySelector('#input_cJulia_y').value);
            c = new NumComplesso(cX, cY);
        }

        console.log('il punto c scelto per l\' insieme di julia è', c);

    }

    loop();
}


function draw() {
    if (chunkAttuale < chunks.length) {
        for (let x = chunks[chunkAttuale].xI; x < chunks[chunkAttuale].xF; x += step) {
            for (let y = chunks[chunkAttuale].yI; y < chunks[chunkAttuale].yF; y += step) {
                //nel caso di insieme di mandelbrot c dipende dal punto da disegnare
                if (insiemeDi == 0) { c = new NumComplesso(x, y); }

                let zn = new NumComplesso(0, 0);
                //TODO: modificare zn iniziale in caso di frattali particolari
                if (altriFrattali == 6) { zn = new NumComplesso(1, 1); }
                //in caso di insieme di Julia è zn che dipende dal punto, mentre c è casuale
                if (insiemeDi == 1) {
                    zn = new NumComplesso(x, y);
                }

                let n = 0;
                while (n < numMassimoDiIterazioniPerNumeroComplesso && moduloComplessoAlQuadrato(zn) < 4) {
                    n++;
                    //se sto scegliendo un frattale normale di mandelbrot o un insieme di Julia
                    if (altriFrattali == 0 || insiemeDi == 1) {
                        if (cFunzioneDiMandelbrotAlDenominatore) {
                            zn = sommaComplessi(potenzaComplesso(zn, mFunzioneDiMandelbrot), divisioneComplessi(new NumComplesso(1, 0), c));
                        }
                        else {
                            zn = sommaComplessi(potenzaComplesso(zn, mFunzioneDiMandelbrot), c);
                        }
                    }
                    else {
                        if (altriFrattali == 1) { zn = esponenzialeComplesso(divisioneComplessi(potenzaComplesso(zn, 3), potenzaComplesso(c, 3))); }
                        if (altriFrattali == 2) { zn = esponenzialeComplesso(divisioneComplessi(zn, potenzaComplesso(c, 4))); }
                        if (altriFrattali == 3) { zn = sommaComplessi(cosenoComplesso(zn), divisioneComplessi(new NumComplesso(1, 0), c)); }
                        if (altriFrattali == 4) { zn = cosenoComplesso(divisioneComplessi(zn, c)); }
                        if (altriFrattali == 5) { zn = sommaComplessi(sommaComplessi(potenzaComplesso(zn, 2), potenzaComplesso(c, 6)), new NumComplesso(-1, 0)); }
                        //not working potenza 3/2
                        if (altriFrattali == 6) { zn = esponenzialeComplesso(divisioneComplessi(sommaComplessi(potenzaComplesso(zn, 2), zn), potenzaComplesso(c, 3 / 2))); }
                    }
                }
                iterazioniTotali += n;
                if (n < numMassimoDiIterazioniPerNumeroComplesso) {
                    //console.log('diverge dopo ' + n + ' iterazioni');
                    divergeTotali++;
                    //SCALA LINEARE
                    let grigio = 0;
                    if (scalaColore == 0) {
                        grigio = (255 * n) / numMassimoDiIterazioniPerNumeroComplesso;
                    }
                    //SCALA LOGARITMICA (forse)
                    if (scalaColore == 1) {
                        grigio = (255 * Math.log((numMassimoDiIterazioniPerNumeroComplesso / n))) / (Math.log(numMassimoDiIterazioniPerNumeroComplesso));
                    }

                    grigio = 255 - grigio;

                    //lasciare per ultimo in modo che dia bianco come colore
                    if (scalaColore == 2) {
                        grigio = 255;
                    }

                    fill(color(grigio, grigio, grigio));
                }
                else {
                    //console.log('converge');
                    convergeTotali++;
                    //black è 0 0 0
                    fill(color('black'));
                }
                ellipse((dimX / 2) + ((x - centroX) * zoom), (dimY / 2) - ((y - centroY) * zoom), step * zoom, step * zoom);
            }
        }
        chunkAttuale++;
    }
    else {
        console.log('esecuzione terminata, ' + convergeTotali + ' punti convergono, ' + divergeTotali + ' divergono. Totale ' + (convergeTotali + divergeTotali) + ' punti');
        console.log('iterazioni totali: ' + iterazioniTotali + ', massime: ' + (convergeTotali + divergeTotali) * numMassimoDiIterazioniPerNumeroComplesso)
        noLoop();
    }
}

function ridisegna() {
    setup();
}