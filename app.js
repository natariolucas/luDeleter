var Twitter = require('twitter');
var ontime = require('ontime');

var client = new Twitter({
 consumer_key: 'vXUKKXfpl3i7KelwkX5dTfgac',
 consumer_secret: '7h7e6Qrcps6tlyhuXkJbsQ4gqdw9LLlzEcZaQ26jiGqSoVSD8K',
 access_token_key: '1891919095-lLWvCEWKfEEhuvwcxNQlZ0zZpn29a0fwsouUCtk',
 access_token_secret: '5HqyYPYgnPxLHf6lp6cttEzKH5jwJRxlKkTDebYwdB6B2'
 // consumer_key: 'EJeDRXQy1crTvTblYHWDBZAb5',
 // consumer_secret: 'g4xcxd91rVfJkMunNLZrSlaiw4F5QeG1wn90DftVvKwlhSVGIR',
 // access_token_key: '260895654-2B5xGJO5KIwrdo8lj3ldtYjvF9kcsFlr6zb3Av25',
 // access_token_secret: 'Vkut6POrdzFZLKfIbSfQuqFLFToaTQBtlnBBw9P1O4VRv'
});

 //const idTweetDecision = '1075178276870602752';
 const idMyTwitterAcc = '1891919095'; //Lucas
 const idMyTwitterAcc2 = '260895654' //Uber
 var arrHorarios = [];
 var arrIds = [];

var OT;
const separador = '------------------------------';

function tweetHistoria (tweet) {
      //Se muestra la fecha actual y se muestra la fecha + 24hs
      var d = new Date(); 
      d.setDate(d.getUTCDate());
      console.log('Fecha: ' + d);
   
      d.setDate(d.getDate() + 1); //Suma (1 dia)
      //getMonth +1 es porque cuenta Enero = 0, Dic = 11
      var formatedDate = (d.getMonth() + 1).toString() + '-' + (d.getDate()).toString() + 'T' + (d.getHours()).toString() + ':' + (d.getMinutes()).toString() + ':00' ;
      
      console.log('Fecha +24: ' + d);
      console.log('Fecha formateada + 24: ' + formatedDate);
  
     arrHorarios.push(formatedDate); //Se agrega la fecha +24hs al array que dispara el ontime
     arrIds[formatedDate] = tweet.id_str; //Se agrega el horario y se asocia a un ID de tweet
  
     renovarOnTime(arrHorarios);
}

//Function ontime
function renovarOnTime (arrrayHorarios) {
  OT = ontime({
    cycle: arrrayHorarios,
    utc: true
  }, function (ot) {

   var twDelete = arrIds[arrrayHorarios[0]];
   console.log('Tweet a eliminar: ' + twDelete);
  
   client.post('statuses/destroy', {id: twDelete}, function (error, response) {
     if (error) console.log(error);
     console.log(response)
   })

   delete arrIds[formatedDate];
   //Condicional para que si queda el array vacio no se lo muestre al ontime (renueve)
   if (arrHorarios.length == 1) {
    arrHorarios.shift();
   } else {
    arrHorarios.shift();
   //Renovar los horarios con recursividad
   renovarOnTime();

   }

    ot.done()
    return
  })
}

 // ------------------------------------STREAM
  var stream = client.stream('statuses/filter', {
      follow: idMyTwitterAcc
  });

  stream.on('data', function(tweet) { 
      if ((tweet.text).includes("/>") == true) {
        console.log('Tweet added ID: ' + tweet.id_str);
        console.log('Tweet added content' + tweet.text);
        tweetHistoria(tweet);
      } else {
        console.log('Rejected ID: ' + tweet.id_str + ' - content: '  + tweet.text);
      }

      console.log(separador);
  });

  stream.on('error', function(error) {
    console.log(error);
    });
