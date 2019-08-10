package vonsim.simulator

import ComputerWord._


object ComputerWord {
    
  def minimalWordFor(x:Int)={
    bytesFor(x) match{
      case 2 => Option(DWord(x))
      case 1 => Option(Word(x))
      case _ => None 
    }
    
    
  }
  
  // Minimum number of bytes to encode a number
  def ca2range(bytes:Int)={
    val h= (Math.pow(2,(bitsPerByte*bytes)-1)-1).toInt
    val l= -(h +1)
    (l,h)
  }
  def bssRange(bytes:Int)={
    val h= (Math.pow(2,bitsPerByte*bytes)-1).toInt
    (0,h)
  }
  def mixedRange(bytes:Int)={
    val (l1,h1) = ca2range(bytes)
    val (l2,h2) = bssRange(bytes)
    ( Math.min(l1,l2), Math.max(h1,h2) )
  }
  def between(x:Int,range:(Int,Int))={
    //!(x<range._1 || range._2<x)
    range._1<=x && x<=range._2
  }
  def bytesFor(x:Int)={
    var n=x
    var bytes=1
    var r=mixedRange(bytes)
    while (!between(x,r)){
      bytes+=1
      r=mixedRange(bytes)
    }
    bytes
  }
  
  def bitsPerByte=8
  
  def unsignedToSignedByte(n: Int) = {
    assert(n >= 0 && n <= 255)
    if (n < 128) {
      n
    } else {
      n - 256
    }
  }
  def signedToUnsignedShort(n: Int) = {
    val all=(Math.pow(2,16)).toInt
    if (n >= 0) {
      n
    } else {
      n + all
    }
  }
  
  def unsignedToSignedShort(n: Int) = {
    
    val all=(Math.pow(2,16)).toInt
    val positives=(Math.pow(2,15)).toInt
//    println(s"positives $positives all $all")
    assert(n >= 0 && n < all)
    if (n < positives) {
      n
    } else {
      n - all
    }
  }
  def signedToUnsignedByte(n: Int) = {
    if (n >= 0) {
      n
    } else {
      n + 256
    }
  }
  
//  implicit def int2word(v:Int):Word=Word(v.toByte)
    implicit def word2byte(w:Word):Byte=w.v
    implicit def byte2word(v:Byte):Word=Word(v)
//  implicit def dword2byte(w:DWord):(Byte,Byte)=(w.l,w.h)
    implicit def byte2dword(v:(Byte,Byte)):DWord=DWord(v)
  
  implicit class BooleanExtensions(b: Boolean) {
    def toInt = if (b) 1 else 0
  }
  implicit class IntExtensions(b: Int) {
    def toBoolean = b!=0
  }
  implicit class IntListAsByte(s: IndexedSeq[Int]) {
    def toByte() = {
      s.toInt.toByte
    }
    def toInt() = {
      (0 until s.length).fold(0) { (z, i) => z | ((1 << i) * s(i)) }
    }
    
    def toDWord() :DWord= {
      val (l,h)=s.splitAt(bitsPerByte)
      DWord(l.toByte(),h.toByte())
    }
    def toWord():Word= {
      Word(s.toByte)
    }
    
  }
  
  
}
abstract class ComputerWord {
  
  def toDWord:DWord
    
  def bytes:Int
  def maxSigned=(-minSigned)-1
  def minSigned=(-numbers/2)
  def maxUnsigned=numbers-1
  def numbers=Math.pow(2, bits).toInt
  
  def toBits():IndexedSeq[Int]
  def bitString:String
  def bits=bitsPerByte*bytes
  
  def bitsPerByte=ComputerWord.bitsPerByte
  def toInt:Int
  def toUnsignedInt:Int
  
  def toByteList():List[Word]
  
}

object Word {

  def apply(v:Byte)= new Word(v)
  def apply(v:Int)= new Word(v.toByte)
  def apply(s:String)={
    assert(s.length()==8)
    new Word(unsignedToSignedByte(Integer.parseInt(s,2)).toByte)
  }
  
}
class Word(var v:Byte) extends ComputerWord{
    
    def bytes=1
//    def maxSigned =127
//    def minSigned = (-128)
//    def numbers=256
  
    def sign: Boolean = v < 0
    def bit(i: Int) = ((v & (0x01 << i)) > 0).toInt
    
    def toBits() = (0 to bits-1) map {bit(_)}
    def toDWord()=DWord(v,0)
    
    def bitString= toBits().mkString("")
    override def toString()=s"Word(${this.bitString.reverse})"
    def toInt=v.toInt
    def toUnsignedInt=signedToUnsignedByte(toInt)
    
    
    override def equals(a:Any)={
      a match{
        case a:Word => a.v == v
        case _ => false
      }
    }
    override def hashCode()={
      v.hashCode()
    }
    override def toByteList():List[Word]={
      List(this)
    }
}

object DWord {
  
  
  
  //implicit def int2dword(v:Int):DWord=DWord(v)
  def apply()= new DWord(0,0)
  def apply(l:Byte,h:Byte)= new DWord(l,h)
  def apply(v:(Byte,Byte))= new DWord(v._1,v._2)
  
  def apply(s:String):DWord={
    assert(s.length()==16)
    DWord(unsignedToSignedShort(Integer.parseInt(s,2)))
  }
  
  def apply(i:Int)= {
    var l=i & 0xFF
    var h=(i & 0xFF00)>> bitsPerByte
    new DWord(l.toByte,h.toByte)
  }
  
  
}

class DWord(var l:Byte, var h:Byte) extends ComputerWord{
  
  def toInt: Int =  (h << bitsPerByte) + signedToUnsignedByte(l)
  def toUnsignedInt=signedToUnsignedShort(toInt)
  
  def sign: Boolean = toInt < 0
  def toDWord=this
  
  def bytes=2
  
  def bit(i: Int) = {
    if (i<bitsPerByte){
      Word(l).bit(i)
    }else{
      Word(h).bit(i-bitsPerByte)
    }
    
  }
  
  def toBits() = (0 to bits-1) map {bit(_)}
  
  def bitString= toBits().mkString("")
  override def toString()=s"DWord(${this.bitString.reverse})"
  
   override def equals(o: Any) = o match {
    case that: DWord => that.l==l && that.h==h
    case _ => false
  }
  override def hashCode = l.hashCode()
  
  override def toByteList():List[Word]={
    
      List(Word(this.l),Word(this.h))
    }
  
}