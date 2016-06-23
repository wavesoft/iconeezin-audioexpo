var Iconeezin=Iconeezin||{};Iconeezin.Experiments=Iconeezin.Experiments||{},Iconeezin.Experiments.simple=function(t){function e(n){if(i[n])return i[n].exports;var r=i[n]={exports:{},id:n,loaded:!1};return t[n].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var i={};return e.m=t,e.c=i,e.p="",e(0)}([function(t,e,i){var n=i(1),r=i(2),o=i(3),s=function(t){r.Experiment.call(this,t),this.anchor.position.set(0,0,3),this.anchor.direction.set(0,1,0);var e=t["simple/models/corridor"];e.traverse(function(t){t instanceof n.Mesh&&(t.material=new n.MeshNormalMaterial)}),this.corridors=new o(e),this.add(this.corridors)};s.prototype=Object.create(r.Experiment.prototype),s.prototype.onShown=function(){var t=function(){this.corridors.runExperiment(function(e){console.log("dir =",e),t()})}.bind(this);t()},s.prototype.onUpdate=function(t){},t.exports=s},function(t,e){t.exports=Iconeezin.Libraries.three},function(t,e){t.exports=Iconeezin.API},function(t,e,i){"use strict";var n=i(4),r=i(1);const o=-1,s=0,a=1;var c=function(t){r.Object3D.call(this),this.objects=[];for(var e=0;e<4;e++){var i=t.clone();i.visible=!1,this.objects.push(i),this.add(i)}this.matLeft=new r.Matrix4,this.matLeft.multiply((new r.Matrix4).makeTranslation(-19.0919,41.9914,0)),this.matLeft.multiply((new r.Matrix4).makeRotationZ(Math.PI/4)),this.matRight=new r.Matrix4,this.matRight.multiply((new r.Matrix4).makeTranslation(19.0919,41.9914,0)),this.matRight.multiply((new r.Matrix4).makeRotationZ(-Math.PI/4)),this.leftInteraction=new r.Mesh(new r.BoxGeometry(14,20,12,1,1,1),new r.MeshBasicMaterial({color:0,wireframe:!0})),this.leftInteraction.position.set(0,10,6),this.leftInteraction.updateMatrix(),this.leftInteraction.material.visible=!1,this.rightInteraction=this.leftInteraction.clone();var c=new r.Matrix4;c.makeTranslation(-4.94975,27.8492,0),c.multiply((new r.Matrix4).makeRotationZ(Math.PI/4)),this.leftInteraction.applyMatrix(c),c.makeTranslation(4.94975,27.8492,0),c.multiply((new r.Matrix4).makeRotationZ(-Math.PI/4)),this.rightInteraction.applyMatrix(c),this.splineLeft=new r.CubicBezierCurve3(new r.Vector3(0,0,3),new r.Vector3(0,22,3),new r.Vector3(0,22,3),new r.Vector3((-19.0919),41.9914,3)),this.splineRight=new r.CubicBezierCurve3(new r.Vector3(0,0,3),new r.Vector3(0,22,3),new r.Vector3(0,22,3),new r.Vector3(19.0919,41.9914,3)),this.freeObject=1,this.referenceObject=this.objects[0],this.leftObject=null,this.rightObject=null,this.direction=o,this.canChangeDirection=!0,n.API.makeInteractive(this.leftInteraction,{gaze:!0,onInteract:function(){this.canChangeDirection&&this.setDirection(s)}.bind(this)}),n.API.makeInteractive(this.rightInteraction,{gaze:!0,onInteract:function(){this.canChangeDirection&&this.setDirection(a)}.bind(this)})};c.prototype=Object.create(r.Object3D.prototype),c.prototype.runExperiment=function(t){var e=s;Math.random()>.5&&(e=a);var i=this.createCrossing(this.referenceObject);this.direction=o,this.canChangeDirection=!0,n.Runtime.Controls.followPath([this.splineLeft,this.splineRight][e],{speed:2,matrix:this.referenceObject.matrix,callback:function(n){if(1==n){var r=this.direction;r==o&&(r=e),this.referenceObject=i[r],t&&t(this.direction)}else n<.5?this.canChangeDirection=!0:this.canChangeDirection=!1}.bind(this)})},c.prototype.setDirection=function(t){switch(t){case s:console.log("Switching to LEFT"),n.Runtime.Controls.replaceFollowPath(this.splineLeft);break;case a:console.log("Switching to RIGHT"),n.Runtime.Controls.replaceFollowPath(this.splineRight)}this.direction=t},c.prototype.createCrossing=function(t){var e=this.objects[this.freeObject];this.freeObject=(this.freeObject+1)%this.objects.length;var i=this.objects[this.freeObject];return this.freeObject=(this.freeObject+1)%this.objects.length,t.visible=!0,e.visible=!0,i.visible=!0,e.matrix.copy(t.matrix),i.matrix.copy(t.matrix),e.applyMatrix(this.matLeft),i.applyMatrix(this.matRight),t.add(this.leftInteraction),t.add(this.rightInteraction),[e,i]},c.prototype.onUpdate=function(t){},t.exports=c},function(t,e){t.exports=Iconeezin}]);