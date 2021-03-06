
const $ = require('jquery');
import Vue from 'vue';


var io = require('socket.io-client');


var app;
var dashboardData;


var queuedTransactionsList;
var activeTransactionsList;
var poolConfig;
var poolStats;
var submittedShares;
var submittedSolutions;

export default class OverviewRenderer {

    init( )
    {

      var self = this;



      var current_hostname = window.location.hostname;

      const socketServer = 'http://'+current_hostname+':4000';

      const options = {transports: ['websocket'], forceNew: true};
      this.socket = io(socketServer, options);


      // Socket events
      this.socket.on('connect', () => {
        console.log('connected to socket.io server');
      });


      this.socket.on('disconnect', () => {
        console.log('disconnected from socket.io server');
      });


      this.socket.on('activeTransactionData', function (data) {

        for(var i in data )
        {
          data[i].formattedStatus =  self.getFormattedStatus(data[i].receiptData)
        }

       console.log('got activeTransactionData', JSON.stringify(data));

        Vue.set(activeTransactionsList, 'transactions',  {tx_list: data.slice(0,50) }  )

      });


      this.socket.on('queuedTransactionData', function (data) {

        for(var i in data )
        {
          data[i].formattedStatus =  self.getFormattedStatus(data[i].receiptData)
        }

         console.log('got queuedTransactionData', JSON.stringify(data));

           Vue.set(queuedTransactionsList, 'transactions', {tx_list: data.slice(0,50) } )

      });



      this.socket.on('poolConfig', function (data) {
        console.log('got poolConfig ', JSON.stringify(data));

        Vue.set(poolConfig.pool, 'poolConfig',  data.poolConfig )

      });

        this.socket.on('poolStats', function (data) {
          console.log('got poolStats ', JSON.stringify(data));

          Vue.set(poolStats.pool, 'poolStats',  data )
        });

        this.socket.on('submittedShares', function (data) {
          console.log('got submittedShares ', JSON.stringify(data));

          Vue.set(submittedShares.shares, 'submittedShares',  data.slice(0,50))
        });


//working ?
        this.socket.on('submittedSolutions', function (data) {

          console.log('got submittedSolutions ', JSON.stringify(data));

          Vue.set(submittedSolutions.solutions, 'submittedSolutions',  data.slice(0,50))

        });

      queuedTransactionsList = new Vue({
          el: '#queuedTransactionsList',
          data: {
            //parentMessage: 'Parent',
            transactions: {
              tx_list: []
            }
          }
        })

        activeTransactionsList = new Vue({
            el: '#activeTransactionsList',
            data: {

              transactions: {
                tx_list: []
              }
            }
          })


         poolConfig = new Vue({
        el: '#poolconfig',
        data:{
          pool:{
            poolConfig: {  }
           }
         }
      });


        poolStats = new Vue({
       el: '#poolstats',
       data:{
         pool:{
           poolStats: { }
          }
        }
     });

     submittedShares = new Vue({
    el: '#submittedShares',
    data:{
      shares:{
        submittedShares: []
       }
     }
  });

  submittedSolutions = new Vue({
 el: '#submittedSolutions',
 data:{
   solutions:{
     submittedSolutions: []
    }
  }
});


      this.show();

      console.log('socket emit ')
       this.socket.emit('getPoolConfig');
       this.socket.emit('getPoolStats');
       this.socket.emit('getActiveTransactionData');
       this.socket.emit('getQueuedTransactionData')
       this.socket.emit('getSubmittedShares')

    }


    getFormattedStatus(receiptData)
    {
        if(receiptData.success) return 'success';
      if(receiptData.mined) return 'mined';
      if(receiptData.pending) return 'pending';
      if(receiptData.queued) return 'queued';
      return '?'
    }


     update(renderData)
    {
      this.socket.emit('getPoolConfig');
      this.socket.emit('getPoolStats');
      this.socket.emit('getActiveTransactionData');
      this.socket.emit('getQueuedTransactionData')
      this.socket.emit('getSubmittedShares')

        this.show();
    }

    hide()
    {
      $('#dashboard').hide();
    }

    show()
    {
      $('#dashboard').show();
    }

}
