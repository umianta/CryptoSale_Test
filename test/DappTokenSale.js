// const { assert } = require("console");
const { equal, strictEqual } = require("assert");
const { assert } = require("console");
const _deploy_contracts = require("../migrations/2_deploy_contracts");

var DappTokenSale=artifacts.require('DappTokenSale.sol');
var DappToken=artifacts.require('DappToken.sol');
contract('DappTokenSale' ,function(accounts){
    var tokenSaleInstance;
    var tokenInstance ;
    var tokenPrice =1000000000000000 //in wei 0.001 ete
    var admin =accounts[0];
    var buyer=accounts[1];
    var numberOfToken ;
    var tokensAvailable =750000;
    it('initializes the contract with the correct values',function(){
        return DappTokenSale.deployed().then(function(instance){
            tokenSaleInstance=instance ;
            return tokenSaleInstance.address ;
        }).then(function(address){
            assert.notEqual(address,0x0,'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address,0x0,'has a token contract');
            return tokenSaleInstance.tokenPrice();
        }).then (function(price)
        {
            assert.equal(price,tokenPrice,'token price is correct');
        });
    });

    it('facilitates token buying ',function(){
        return DappToken.deployed().then(function(instance){
            //Grab token instance first 
            tokenInstance=instance ;
            return DappTokenSale.deployed();
        }).then(function(instance) {
            //Then grab token sale instance
            tokenSaleInstance=instance ;
            //Provision 75% of all token to token sale 
            return tokenInstance.transfer(tokenSaleInstance.address,tokensAvailable, {from :admin})
        }).then(function(receit){
            numberOfToken=10;
            var value=numberOfToken * tokenPrice;
            return tokenSaleInstance.buyTokens(numberOfToken ,{ from :buyer ,value: value}) ;

    }).then(function(receipt) {
        assert.equal(receipt.logs.length,1,'trigger one event');
        assert.equal(receipt.logs[0].event,'Approval' ,'should be the "Approval" event')
        assert.equal(receipt.logs[0].args._owner,accounts[0],'logs the account the tokens are authorized by')
        assert.equal(receipt.logs[0].args._spender ,accounts[1],'logs the account the token are authorized to')
        assert.equal(receipt.logs[0].args._value,100 ,'logs the transfer amount');
       
        return tokenSaleInstance.tokensSold();
    }).then(function(amount){
        assert.equal(amount.toNumber(),numberOfToken,'increments the number of tokens sold');
        return tokenInstance.balanceOf(buyer);
    }).then(function(balance){
        assert.equal(balance.toNumber(),numberOfToken);
        return tokenInstance.balanceOf(tokenSaleInstance.address)
    }).then(function(balacne){
        assert.equal(balacne.toNumber(),tokensAvailable- numberOfToken);
        //Try to buy tokens different from the ether value 
        return tokenSaleInstance.buyToken(numberOfToken ,{from:buyer ,value:1});
}).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert')>=0,'msg.value must equal number of tokens in wei');
        return tokenSaleInstance.buyTokens(800000,{from:buyer,value : numberOfToken * tokenPrice});
    }).then(assert.fail).catch(function(error){
        assert(error.message.indexOf('revert') >=0 ,'cannot purchase than tokens more than available tokens');
    })
});
    it('ends token sale' ,function(){
        return DappToken.deployed().then(function(instance){
            //Grab token instance first
            tokenInstance=instance ;
            return DappTokenSale.deployed();
        }).then(function(instance){
            //then grab token sale instance 
            tokenSaleInstace= instance ;
            //Try to end sale from the account other than the  admin
            return tokenSaleInstance.endSale({from:buyer});

        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0,'must be admin to end the sale');
            //End sale as admin
            return tokenSaleInstance.endSale({from:admin})
        }).then(function(receipt){
           //Receipt 
           return tokenInstance.balanceOf(admin);

        }).then(function(balance){
            assert.equal(balance.toNumber(),999990,'returns all unsold tokens to admin');
            //Check thata token price was reset when selfDesctructor is called  
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            strictEqual(price.toNumber(),0,'token price was reset');
        })
    
    });
}); 