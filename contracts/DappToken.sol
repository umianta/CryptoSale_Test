pragma solidity >=0.4.22 <0.9.0;

contract DappToken
{
    //Constructor 
    //Set the total number of tokens
    //Read the total number of tokens
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf ;
    mapping(address => mapping(address => uint256)) public allowance;
    //Name
    string public name ="DApp Token";
    //Symbol
    string public symbol="DAPP";

    //Standard
    string public standard="DApp Token v1.0";
    //Allowance
    //Transfer Event

    event Transfer (
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval (
        address indexed _owner,
        address indexed _spender ,
        uint256 _value
        
    );
    constructor(uint _initialSupply) public 
    {
         balanceOf[msg.sender] =_initialSupply;
         totalSupply =_initialSupply;
         //Allocate the initial supply    
    }

    //Transfer
    function transfer(address _to, uint256 _value) public returns (bool success) {
         //Exception if the account does not have enough
        require(balanceOf[msg.sender] >= _value);
         //Return a boolean 
        //Transfer event
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    //Delegated Transfer 
    //Approve
    function approve(address _spender ,uint256 _value) public returns (bool success)
    {
        //allowance
         allowance[msg.sender][_spender] =_value;
        //Approve event
        emit Approval(msg.sender,_spender,_value);
        return true;

    }
    //TransferFrom
    function transferFrom(address _from ,address _to ,uint256 _value ) public returns (bool success)
    {
        //Requiere _from has enough tokens 
        require(_value <= balanceOf[_from]);
        //Require allowance is big enough 
        require(_value<=allowance[_from][msg.sender]);
        //Change balance 
        balanceOf[_from] -=_value;
        balanceOf[_to]+= _value;
        //update the allowance
        allowance[_from][msg.sender] -=_value;
         //transfer event 
         emit Transfer(_from, _to, _value);
        return true;
    }
   


}