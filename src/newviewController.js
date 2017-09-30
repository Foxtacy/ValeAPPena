const electron = require('electron')
const $ = require('jquery')
const ipc = electron.ipcRenderer
const swal = require('sweetalert')
const fs = require("fs")
const {dialog} = require('electron').remote

var data = {};
var metas = [];

var payload = null;

function Meta (){
    this.valor = 0;
    this.periodo = 0;
    this.valorAcumuladoPeriodo = 0;
    this.calcularValorAcumuladoPeriodo = function(valorAcumuladoDia,valorBase){
        this.valorAcumuladoPeriodo = valorAcumuladoDia * this.periodo;
        this.valorAcumuladoPeriodo += valorBase;
    }
    this.montarResultado = function(){
        var strPeriodo = templateStringPeriodo.split("{periodo}").join(this.periodo);
        var resultado = "";
        if (this.valorAcumuladoPeriodo >= this.valor){
            resultado = templateStringVale.split("{periodo}").join(this.periodo);
            return '<p class="bg-success">'+strPeriodo + this.valorAcumuladoPeriodo + ". "+resultado+"</p>";
        } else {
            var faltou = parseFloat(this.valor - this.valorAcumuladoPeriodo);
            resultado = templateStringNaoVale.split("{periodo}").join(this.periodo)
                                             .split("{faltou}").join(faltou);
            return '<p class="bg-danger">'+strPeriodo + resultado+"</p>";
        }
    }
}   

var formId = 0;
var templateStringPeriodo = 'O valor acumulado no período de {periodo} dias é: ';
var templateStringVale = 'Em termos de valor em {periodo} dias vale a pena! ';
var templateStringNaoVale = 'Em termos de valor em {periodo} dias não vale a pena! Faltou: {faltou} para atingir a meta!';

$('#btnCalculate').on('click', function(){

    var custoOperacionalDiario  = parseFloat($('#inputCOD').val());
    var horasTrabalhoDia        = parseFloat($('#inputHTD').val());
    var valorHora               = parseFloat($('#inputVDH').val());
    var valorBase               = parseFloat($('#inputVB').val());
    
    var errors = [];

    if (isNaN(custoOperacionalDiario)){
        errors.push("Custo Operacional Diário");
    }

    if (isNaN(horasTrabalhoDia)){
        errors.push("Horas de Trabalho por Dia");
    }

    if(isNaN(valorHora)){
        errors.push("Valor da Hora");
    }

    if(isNaN(valorBase)){
        errors.push("Valor Base");
    }
    
    var valorAcumuladoDia     = (horasTrabalhoDia * valorHora) - custoOperacionalDiario;

    var text = "";
    
    var metaIds = $(".meta").each(function(i,e){
        var formValor = parseFloat($("#inputVM"+e.id).val());
        if (isNaN(formValor)) errors.push ("Valor da Meta");
        var formPeriodo = parseFloat($("#inputPM"+e.id).val());
        if (isNaN(formPeriodo)) errors.push ("Período da Meta");
        var meta = new Meta();
        meta.valor = formValor;
        meta.periodo = formPeriodo;
        meta.calcularValorAcumuladoPeriodo(valorAcumuladoDia,valorBase);
        metas.push(meta);
        text += meta.montarResultado();
    });

    if (errors.length != 0){
        swal('Existem erros nos seguintes campos: '+errors.join(","));
        return;
    } 

    data.custoOperacionalDiario = custoOperacionalDiario;
    data.horasTrabalhoDia = horasTrabalhoDia;
    data.valorHora = valorHora;
    data.valorBase = valorBase;
    data.valorAcumuladoDia = valorAcumuladoDia;
    data.metas = metas;

    payload = JSON.stringify(data);

    $('#result').html(text);

});


$('#btnAddGoal').on('click', function(){
    var templateNovaMeta = "<div id='{v}' class='meta'>"
                                .concat("<div class='col-md-6 col-sm-6'>")
                                .concat("<div class='input-group'>")
                                    .concat("<span class='input-group-addon' id='spanPM{v}'>Período da Meta</span>")
                                    .concat("<input id='inputPM{v}' type='text' class='form-control' placeholder='Período da Meta' aria-describedby='spanPM{v}'>")
                                    .concat("</div>")
                                .concat("</div>")
                                .concat("<div class='col-md-6 col-sm-6'>")
                                .concat("<div class='input-group'>")
                                    .concat("<span class='input-group-addon' id='spanVM{v}'>Valor da Meta</span>")
                                    .concat("<input id='inputVM{v}' type='text' class='form-control' placeholder='Valor da Meta' aria-describedby='spanVM{v}'>")
                                    .concat("</div>")
                                .concat("</div>")
                            .concat("</div>");

    $("#metas").append(templateNovaMeta.split("{v}").join(formId));
    formId++;
});

$('#btnSave').on('click', function(){
    
    if (payload != null){

        dialog.showSaveDialog(function (fileName) {

            if (fileName === undefined) return;

            fs.writeFile(fileName, payload, function(err) {
                if(err) {
                    swal('Erro ao salvar arquivo: '+err);
                }

                swal('Arquivo salvo com sucesso!, em: '+path);
            }); 

        }); 
        
    }

});

$('#btnLoad').on('click', function(){
    var path = dialog.showOpenDialog(
        {
            //openDirectory
            properties: ['openFile', 'multiSelections'],
            filters: [
                {name: 'All Files', extensions: ['*']}
            ]
        });

    var fileData;

    fs.exists(path[0], function(exists){
        if(exists){ // results true
            fs.readFile(path[0], {encoding: "utf8"}, function(err, data){
                if(err){
                    console.log(err)
                }              
                console.log(data);
                fileData = JSON.parse(data);
                consumirJSON(fileData);
            })
        }
    });

    
});

$('#btnNew').on('click', newForm);

function newForm(){
    data = {};
    metas = [];
    formId = 0;

    $('#inputCOD').val("");
    $('#inputHTD').val("");
    $('#inputVDH').val("");
    $('#inputVB').val("");

    $("#metas").html("");
    $("#result").html("Ainda não sei :(");
}

function consumirJSON(fileData){
    if (fileData != undefined){
        $('#inputCOD').val(fileData.custoOperacionalDiario);
        $('#inputHTD').val(fileData.horasTrabalhoDia);
        $('#inputVDH').val(fileData.valorHora);
        $('#inputVB').val(fileData.valorBase);

        for (var i = 0; i<fileData.metas.length;i++){
            var e = fileData.metas[i];
            $('#btnAddGoal').trigger('click');
            $("#inputVM"+i).val(e.valor);
            $("#inputPM"+i).val(e.periodo);
        }

        $('#btnCalculate').trigger("click");
    }
}

$(document).ready(function (){

    /*
    $("#inputCOD").mask('000.000.000.000.000,00', {reverse: true});
    $("#inputHTD").mask('00000000000000000', {reverse: true});
    $("#inputVDH").mask('000.000.000.000.000,00', {reverse: true});
    $("#inputVB").mask('000.000.000.000.000,00', {reverse: true});
    $("#inputPM").mask('00000000000000000', {reverse: true});
    $("#inputVM").mask('000.000.000.000.000,00', {reverse: true});
    */
});


/*
ipc.on('countdown', (evt, count) => {
    console.log("countdown callback");
    document.getElementById('count').innerHTML = count;
});
*/