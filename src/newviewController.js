const electron = require('electron')
const $ = require('jquery')
const ipc = electron.ipcRenderer
const swal = require('sweetalert')

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
            return '<p class="bg-success">'+strPeriodo + resultado+"</p>";
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
        text += meta.montarResultado();
    });

    if (errors.length != 0){
        swal('Existem erros nos seguintes campos: '+errors.join(","));
        return;
    } 
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

/*
ipc.on('countdown', (evt, count) => {
    console.log("countdown callback");
    document.getElementById('count').innerHTML = count;
});
*/