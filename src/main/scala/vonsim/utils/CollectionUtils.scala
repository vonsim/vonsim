package vonsim.utils

import scala.reflect.ClassTag

object CollectionUtils {
  
  implicit class BetterEither[A,B,C](a:Either[A,B]){

      
  }
  implicit class BetterMap[A:ClassTag](m:Map[Int,A]){
    
  }
  
  implicit class EitherList[A,B,C](a:List[Either[A,B]]){
    
      def mapRightEither(f:B => Either[A,C]):List[Either[A,C]]={
        a.map(x => 
            if (x.isLeft){ 
              Left(x.left.get)
            }else{ 
              f.apply(x.right.get)
            }
        )
      }
      def allRight={
        val b=a.map(_.isRight).forall(identity)
        b
      }
      def allLeft={
        val b=a.map(_.isLeft).forall(identity)
        b
      }
      def mapRight(f:B => C):List[Either[A,C]]={
            
        a.map(x => 
            if (x.isLeft){ 
              Left(x.left.get)
            }else{ 
              Right( f.apply(x.right.get) )
            }
        )
        
      }
      
      def lefts():List[A]={
        a.filter(_.isLeft).map(_.left.get)
      }
      def rights():List[B]={
        a.filter(_.isRight).map(_.right.get)
      }
  }
  
}