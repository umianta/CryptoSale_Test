App ={

  web3Provider:null ,
  contracts: {},
  account :'0x0',
  loading:false,
  tokenPrice:1000000000000000,
  tokensSold:0,
  tokensAvailable:750000,
  init: function()
  {
    console.log("App Initialized");
    return App.initWeb3();
  },

  initWeb3:function()
  {
    if(typeof web3 !== 'undefined')
    {
      //If a web3 instance is already provided by Meta mask
      App.web3Provider =web3.currentProvider;
      web3=new Web3(web3.currentProvider);
    }
    else
    {
      //Specify default instance if no web3 instance provided 
      App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545');
      web3=new Web3(App.web3Provider);

    }
  
    return App.initContracts();
  },
  initContracts: function(){
    $.getJSON("DappTokenSale.json",function(dappTokenSale){
        App.contracts.DappTokenSale= TruffleContract(dappTokenSale);
        App.contracts.DappTokenSale.setProvider(App.web3Provider);
        App.contracts.DappTokenSale.deployed().then(function(dappTokenSale){
          console.log("Dapp Token sale address:",dappTokenSale.address);})
        }).done(function(){
            $.getJSON("DappToken.json",function(dappToken){
              App.contracts.DappToken= TruffleContract(dappToken);
              App.contracts.DappToken.setProvider(App.web3Provider);
              App.contracts.DappToken.deployed().then(function(dappToken){
              console.log("Dapp Token  address:",dappToken.address); })
              App.listenForEvents();
              return App.render();
        })
       
      })
    },
    render: function()
    {
      if(App.loading)
      {
        return ;
      }
      App.loading=true;
      var loader=$('#loader');
      var content =$("#content");
      loader.show();
      content.hide();
      //Load account data
      web3.eth.getCoinbase(function(err,account){
        if(err == null)
        {
          App.account =account ;
          $("#accountAddress").html("Your Account : " + account);
        }
      })


      //Load token sale Contract
      App.contracts.DappTokenSale.deployed().then(function(instance){
        tokenSaleInstance =instance ;
        return tokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice){
        App.tokenPrice= tokenPrice;
        console.log("tokenPrice",App.tokenPrice);
        $('.token-price').html(web3.fromWei(App.tokenPrice ,'ether').toNumber());
        return tokenSaleInstance.tokensSold();
      }).then(function(tokensSold){
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
        var progressPrecent =(Math.ceil(App.tokensSold)/App.tokensAvailable)*100;
        $('#progress').css('width',progressPrecent+'%');

        //Load token contract
        App.contracts.DappToken.deployed().then(function(instance){
          tokenInstance=instance;
          return tokenInstance.balanceOf(App.account).then(function(balance){
            $('.dapp-balance').html(balance.toNumber());
            App.loading =false;
            loader.hide();
            content.show();
          })
        })
      })
       
      },

      buyTokens:function(){
        $('#content').hide();
        $('#loader').show();
        var numberOfToken=  $('#numberOfTokens').val();
        App.contracts.DappTokenSale.deployed().then(function(instance){
          return instance.buyTokens(numberOfToken ,{
            from:App.account,
            value:numberOfToken *App.tokenPrice,
            gas:500000
          }).then(function(result){
            console.log("tokens bought...",)
            $('form').trigger('reset') //Reset number of token in form 
            // $('#content').show();
            // $('#loader').hide();
            //Wait for sell events 
          })
        })
      },

      //Listen for events emitted from contract 
      listenForEvents:function(){
        App.contracts.DappTokenSale.deployed().then(function(instance){
          instance.Sell({},{
            fromBlock:0,
            toBlock:'latest',

          }).watch(function(error ,event){
            console.log("event triggered" ,event);
            App.render();
          })
        })
      }
    
}

$(function() {
  App.init();
});