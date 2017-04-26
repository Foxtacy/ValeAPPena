const electron = require('electron')
const $ = require('jquery')
const ipc = electron.ipcRenderer
const swal = require('sweetalert')

$('#btnCalculate').on('click', function(){
    //teste
    
    var custoOperacionalDiario  = parseFloat($('#inputCOD').val());
    var horasTrabalhoDia        = parseFloat($('#inputHTD').val());
    var valorHora               = parseFloat($('#inputVDH').val());
    var numeroDias              = parseFloat($('#inputND').val());

    var metaDiaria  = parseFloat($('#inputMD').val());
    var metaMensal  = parseFloat($('#inputMM').val());
    var metaAnual   = parseFloat($('#inputMA').val());
    var metaPeriodo = parseFloat($('#inputMP').val());

    var valorAcumuladoDia     = (horasTrabalhoDia * valorHora) - custoOperacionalDiario;
    var valorAcumuladoMes     = valorAcumuladoDia * 30;
    var valorAcumuladoAno     = valorAcumuladoMes * 12;
    var valorAcumuladoPeriodo = valorAcumuladoDia * numeroDias;

    var bateuDiaria  = valorAcumuladoDia >= metaDiaria;
    var bateuMensal  = valorAcumuladoMes >= metaMensal;
    var bateuAnual   = valorAcumuladoAno >= metaAnual;
    var bateuPeriodo = valorAcumuladoPeriodo >= metaPeriodo;

    var fraseDia = '';
    var fraseMes = '';
    var fraseAno = '';
    var frasePeriodo = '';

    if (metaDiaria > 0 && valorAcumuladoDia != NaN){
        fraseDia += 'O valor acumulado por dia é: '+valorAcumuladoDia+' ';
        if(bateuDiaria){
            fraseDia += 'Em termos de valor diário vale a pena! ';
            fraseDia = '<p class="bg-success">'+fraseDia+"</p>";
        } else {
            fraseDia += 'Em termos de valor diário não vale a pena! Faltou: '+parseInt(metaDiaria-valorAcumuladoDia)+ ' para atingir a meta!';
            fraseDia = '<p class="bg-danger">'+fraseDia+"</p>";
        }
    }

    if(metaMensal > 0 && valorAcumuladoMes != NaN){
        fraseMes += 'O valor acumulado por mes é: '+valorAcumuladoMes+' ';
        if(bateuMensal){
            fraseMes += 'Em termos de valor mensal vale a pena! ';
            fraseMes = '<p class="bg-success">'+fraseMes+"</p>";
        } else {
            fraseMes += 'Em termos de valor mensal não vale a pena! Faltou: '+parseInt(metaMensal-valorAcumuladoMes)+ ' para atingir a meta!';
            fraseMes = '<p class="bg-danger">'+fraseMes+"</p>";
        }
    }

    if(metaAnual > 0 && valorAcumuladoAno != NaN){
        fraseAno += 'O valor acumulado por ano é: '+valorAcumuladoAno+' ';
        if(bateuAnual){
            fraseAno += 'Em termos de valor anual vale a pena! ';
            fraseAno = '<p class="bg-success">'+fraseAno+"</p>";
        } else {
            fraseAno += 'Em termos de valor anual não vale a pena! Faltou: '+parseInt(metaAnual-valorAcumuladoAno)+ ' para atingir a meta!';
            fraseAno = '<p class="bg-danger">'+fraseAno+"</p>";
        }
    }

    if (metaPeriodo > 0 && valorAcumuladoPeriodo != NaN ){
        frasePeriodo += 'O valor acumulado no período é: '+valorAcumuladoPeriodo+' ';
        if(bateuPeriodo){
            frasePeriodo += 'Em termos do período estipulado vale a pena! ';
            frasePeriodo = '<p class="bg-success">'+frasePeriodo+"</p>"
        } else {
            frasePeriodo += 'Em termos do período estipulado não vale a pena! Faltou: '+parseInt(metaPeriodo-valorAcumuladoPeriodo)+ ' para atingir a meta!';
            frasePeriodo = '<p class="bg-danger">'+frasePeriodo+"</p>"
        }
    }
    
    if (fraseDia == '' && fraseMes == '' && fraseAno == '' && frasePeriodo == ''){
        swal('Preencha pelo menos uma meta!');
        return;
    }

    var text = fraseDia + fraseMes + fraseAno + frasePeriodo; 
    $('#result').html(text);
});

/*
ipc.on('countdown', (evt, count) => {
    console.log("countdown callback");
    document.getElementById('count').innerHTML = count;
});
*/