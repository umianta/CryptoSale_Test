pragma solidity >=0.4.22 <0.9.0;
import "./DappToken.sol";
contract DappTokenSale
{
    address admin ;
    DappToken public tokenContract ;
    uint256 public tokenPrice ;
    uint256 public tokensSold;
    constructor(DappToken _tokenContract ,uint256 _tokenPrice) public {
        //Assign an admin
        admin =msg.sender;
        //Assign Token Contract
        tokenContract=_tokenContract ;
        //Token Price
        tokenPrice =_tokenPrice ;
        
    }

    event Sell(address _buyer ,uint _amount);
   
   //Multiply
   function multiply(uint x, uint y) internal pure returns (uint z)
   {
       require( y== 0 || (z= x*y)/ y== x);
   }

    //Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable
    {   //Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens ,tokenPrice));
        //Require that the contract has enough token
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        //Requiere transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        //Keep track of tokensSold
            tokensSold+=_numberOfTokens;
        //Trigger sale event
        emit Sell(msg.sender,_numberOfTokens);

    }

    //Ending Tokens sale 
    function endSale() public {
        //Require admin
        require(msg.sender == admin);
        //transfer remaining dapp tokens to admin
        require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
      
        //Destroy contract  
        selfdestruct(msg.sender);

    }

}

