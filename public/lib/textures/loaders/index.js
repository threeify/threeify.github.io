(function(exports){"use strict";function normalizedByteToFloats(sourceArray,result=undefined){const scale=1/255;if(result===undefined){result=new Float32Array(sourceArray.length)}for(let i=0;i<sourceArray.length;i++){result[i]=sourceArray[i]*scale}return result}function floatsToNormalizedBytes(sourceArray,result=undefined){const scale=255;if(result===undefined){result=new Uint8Array(sourceArray.length)}for(let i=0;i<sourceArray.length;i++){result[i]=sourceArray[i]*scale}return result}function clamp(value,min,max){return Math.min(Math.max(value,min),max)}const arrayBuffer=new ArrayBuffer(12*16);const floatArray=new Float32Array(arrayBuffer);const intArray=new Int32Array(arrayBuffer);function hashFloat2(v0,v1){floatArray[0]=v0;floatArray[1]=v1;const hash=intArray[0];return hash*397^intArray[1]}function hashFloat4(v0,v1,v2,v3){floatArray[0]=v0;floatArray[1]=v1;floatArray[2]=v2;floatArray[3]=v3;let hash=intArray[0]|0;hash=hash*397^(intArray[1]|0);hash=hash*397^(intArray[2]|0);return hash*397^(intArray[3]|0)}class Vector4{constructor(x=0,y=0,z=0,w=0){this.x=x;this.y=y;this.z=z;this.w=w}get r(){return this.x}set r(r){this.x=r}get g(){return this.y}set g(g){this.y=g}get b(){return this.z}set b(b){this.z=b}get a(){return this.w}set a(a){this.w=a}getHashCode(){return hashFloat4(this.x,this.y,this.z,this.w)}set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this}clone(){return(new Vector4).copy(this)}copy(v){return this.set(v.x,v.y,v.z,v.w)}add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;this.w+=v.w;return this}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;this.w-=v.w;return this}multiplyByScalar(s){this.x*=s;this.y*=s;this.z*=s;this.w*=s;return this}lerp(v,alpha){this.x+=(v.x-this.x)*alpha;this.y+=(v.y-this.y)*alpha;this.z+=(v.z-this.z)*alpha;this.w+=(v.w-this.w)*alpha;return this}normalize(){const length=this.length();return this.multiplyByScalar(length===0?1:1/length)}getComponent(index){if(index===0){return this.x}else if(index===1){return this.y}else if(index===2){return this.z}else if(index===3){return this.w}else{throw new Error(`index of our range: ${index}`)}}setComponent(index,value){if(index===0){this.x=value}else if(index===1){this.y=value}else if(index===2){this.z=value}else if(index===3){this.w=value}else{throw new Error(`index of our range: ${index}`)}return this}dot(v){return this.x*v.x+this.y*v.y+this.z*v.z+this.w*v.w}length(){return Math.sqrt(this.lengthSquared())}lengthSquared(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}equals(v){return v.x===this.x&&v.y===this.y&&v.z===this.z&&v.w===this.w}setFromArray(array,offset){this.x=array[offset+0];this.y=array[offset+1];this.z=array[offset+2];this.w=array[offset+3]}toArray(array,offset){array[offset+0]=this.x;array[offset+1]=this.y;array[offset+2]=this.z;array[offset+3]=this.w}}function rgbeToLinear(source,result=new Vector4){const s=Math.pow(2,source.a*255-128);return result.set(source.r*s,source.g*s,source.b*s,1)}function linearToRgbd(source,maxRange,result=new Vector4){const maxRGB=Math.max(source.r,source.g,source.b);const realD=Math.max(maxRange/maxRGB,1);const normalizedD=clamp(Math.floor(realD)/255,0,1);const s=normalizedD*(255/maxRange);return result.set(source.r*s,source.g*s,source.b*s,normalizedD)}function rgbeToLinearArray(sourceArray,result=undefined){const sourceColor=new Vector4;const destColor=new Vector4;if(result===undefined){result=new Float32Array(sourceArray.length)}for(let i=0;i<sourceArray.length;i+=4){sourceColor.setFromArray(sourceArray,i);rgbeToLinear(sourceColor,destColor);destColor.toArray(result,i)}return result}function linearToRgbdArray(sourceArray,maxRange,result=undefined){const sourceColor=new Vector4;const destColor=new Vector4;if(result===undefined){result=new Float32Array(sourceArray.length)}for(let i=0;i<sourceArray.length;i+=4){sourceColor.setFromArray(sourceArray,i);linearToRgbd(sourceColor,maxRange,destColor);destColor.toArray(result,i)}return result}const GL=WebGLRenderingContext;var DataType;(function(DataType){DataType[DataType["Byte"]=GL.BYTE]="Byte";DataType[DataType["UnsignedByte"]=GL.UNSIGNED_BYTE]="UnsignedByte";DataType[DataType["Short"]=GL.SHORT]="Short";DataType[DataType["UnsignedShort"]=GL.UNSIGNED_SHORT]="UnsignedShort";DataType[DataType["Int"]=GL.INT]="Int";DataType[DataType["UnsignedInt"]=GL.UNSIGNED_INT]="UnsignedInt";DataType[DataType["Float"]=GL.FLOAT]="Float"})(DataType||(DataType={}));var PixelEncoding;(function(PixelEncoding){PixelEncoding[PixelEncoding["Linear"]=0]="Linear";PixelEncoding[PixelEncoding["sRGB"]=1]="sRGB";PixelEncoding[PixelEncoding["RGBE"]=2]="RGBE";PixelEncoding[PixelEncoding["RGBD"]=3]="RGBD"})(PixelEncoding||(PixelEncoding={}));class ArrayBufferImage{constructor(data,width,height,dataType=DataType.UnsignedByte,pixelEncoding=PixelEncoding.sRGB){this.data=data;this.width=width;this.height=height;this.dataType=dataType;this.pixelEncoding=pixelEncoding}}class Buffer{constructor(data,position){this.data=data;this.position=position}}async function fetchCubeHDRs(urlPattern){const cubeMapFaces=["px","nx","py","ny","pz","nz"];const fetchPromises=[];cubeMapFaces.forEach(face=>{fetchPromises.push(fetchHDR(urlPattern.replace("*",face)))});return Promise.all(fetchPromises)}async function fetchHDR(url){const response=await fetch(url);if(!response.ok){throw new Error("response error: "+response.status+":"+response.statusText)}return parseHDR(await response.arrayBuffer())}function parseHDR(arrayBuffer){const buffer=new Buffer(new Uint8Array(arrayBuffer),0);const header=readHeader(buffer);const pixelData=readRLEPixelData(buffer.data.subarray(buffer.position),header.width,header.height);return new ArrayBufferImage(floatsToNormalizedBytes(linearToRgbdArray(rgbeToLinearArray(normalizedByteToFloats(pixelData)),16)),header.width,header.height,DataType.UnsignedByte,PixelEncoding.RGBE)}function stringFromCharCodes(unicode){let result="";for(let i=0;i<unicode.length;i++){result+=String.fromCharCode(unicode[i])}return result}function fgets(buffer,lineLimit=0,consume=true){lineLimit=lineLimit===0?1024:lineLimit;const chunkSize=128;let p=buffer.position,i=-1,len=0,s="",chunk=stringFromCharCodes(new Uint16Array(buffer.data.subarray(p,p+chunkSize)));while(0>(i=chunk.indexOf("\n"))&&len<lineLimit&&p<buffer.data.byteLength){s+=chunk;len+=chunk.length;p+=chunkSize;chunk+=stringFromCharCodes(new Uint16Array(buffer.data.subarray(p,p+chunkSize)))}if(-1<i){if(false!==consume){buffer.position+=len+i+1}return s+chunk.slice(0,i)}return undefined}class Header{constructor(){this.valid=0;this.string="";this.comments="";this.programType="RGBE";this.format="";this.gamma=1;this.exposure=1;this.width=0;this.height=0}}function readHeader(buffer){const RGBE_VALID_PROGRAMTYPE=1;const RGBE_VALID_FORMAT=2;const RGBE_VALID_DIMENSIONS=4;let line,match;const magicTokenRegex=/^#\?(\S+)$/;const gammaRegex=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/;const exposureRegex=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/;const formatRegex=/^\s*FORMAT=(\S+)\s*$/;const dimensionsRegex=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/;const header=new Header;if(buffer.position>=buffer.data.byteLength||(line=fgets(buffer))===undefined){throw new Error("hrd: no header found")}if((match=line.match(magicTokenRegex))===null){throw new Error("hrd: bad initial token")}header.valid|=RGBE_VALID_PROGRAMTYPE;header.programType=match[1];header.string+=line+"\n";while(true){line=fgets(buffer);if(undefined===line){break}header.string+=line+"\n";if("#"===line.charAt(0)){header.comments+=line+"\n";continue}if((match=line.match(gammaRegex))!==null){header.gamma=parseFloat(match[1])}if((match=line.match(exposureRegex))!==null){header.exposure=parseFloat(match[1])}if((match=line.match(formatRegex))!==null){header.valid|=RGBE_VALID_FORMAT;header.format=match[1]}if((match=line.match(dimensionsRegex))!==null){header.valid|=RGBE_VALID_DIMENSIONS;header.height=parseInt(match[1],10);header.width=parseInt(match[2],10)}if((header.valid&RGBE_VALID_FORMAT)!==0&&(header.valid&RGBE_VALID_DIMENSIONS)!==0){break}}if((header.valid&RGBE_VALID_FORMAT)===0){throw new Error("hrd: missing format specifier")}if((header.valid&RGBE_VALID_DIMENSIONS)===0){throw new Error("hdr: missing image size specifier")}return header}function readRLEPixelData(byteArray,width,height){if(width<8||width>32767||2!==byteArray[0]||2!==byteArray[1]||(byteArray[2]&128)!==0){return byteArray}if(width!==(byteArray[2]<<8|byteArray[3])){throw new Error("hdr: wrong scanline width")}const dataRgba=new Uint8Array(4*width*height);let offset=0;let pos=0;const ptrEnd=4*width;const rgbeStart=new Uint8Array(4);const scanlineBuffer=new Uint8Array(ptrEnd);while(height>0&&pos<byteArray.byteLength){if(pos+4>byteArray.byteLength){throw new Error("hdr: read error")}rgbeStart[0]=byteArray[pos++];rgbeStart[1]=byteArray[pos++];rgbeStart[2]=byteArray[pos++];rgbeStart[3]=byteArray[pos++];if(2!==rgbeStart[0]||2!==rgbeStart[1]||(rgbeStart[2]<<8|rgbeStart[3])!==width){throw new Error("hdr: bad rgbe scanline format")}let ptr=0;while(ptr<ptrEnd&&pos<byteArray.byteLength){let count=byteArray[pos++];const isEncodedRun=count>128;if(isEncodedRun){count-=128}if(0===count||ptr+count>ptrEnd){throw new Error("hdr: bad scanline data")}if(isEncodedRun){const byteValue=byteArray[pos++];for(let i=0;i<count;i++){scanlineBuffer[ptr++]=byteValue}}else{scanlineBuffer.set(byteArray.subarray(pos,pos+count),ptr);ptr+=count;pos+=count}}for(let i=0;i<width;i++){let off=0;dataRgba[offset]=scanlineBuffer[i+off];off+=width;dataRgba[offset+1]=scanlineBuffer[i+off];off+=width;dataRgba[offset+2]=scanlineBuffer[i+off];off+=width;dataRgba[offset+3]=scanlineBuffer[i+off];offset+=4}height--}return dataRgba}class Vector2{constructor(x=0,y=0){this.x=x;this.y=y}get width(){return this.x}set width(width){this.x=width}get height(){return this.y}set height(height){this.y=height}getHashCode(){return hashFloat2(this.x,this.y)}set(x,y){this.x=x;this.y=y;return this}clone(){return(new Vector2).copy(this)}copy(v){return this.set(v.x,v.y)}add(v){this.x+=v.x;this.y+=v.y;return this}addScalar(s){this.x+=s;this.y+=s;return this}sub(v){this.x-=v.x;this.y-=v.y;return this}multiplyByScalar(s){this.x*=s;this.y*=s;return this}negate(){this.x*=-1;this.y*=-1;return this}normalize(){const length=this.length();return this.multiplyByScalar(length===0?1:0)}getComponent(index){if(index===0){return this.x}else if(index===1){return this.y}else{throw new Error(`index of our range: ${index}`)}}setComponent(index,value){if(index===0){this.x=value}else if(index===1){this.y=value}else{throw new Error(`index of our range: ${index}`)}return this}dot(v){return this.x*v.x+this.y*v.y}length(){return Math.sqrt(this.lengthSquared())}lengthSquared(){return this.x*this.x+this.y*this.y}min(v){this.x=Math.min(this.x,v.x);this.y=Math.min(this.y,v.y);return this}max(v){this.x=Math.max(this.x,v.x);this.y=Math.max(this.y,v.y);return this}clamp(min,max){this.x=clamp(this.x,min.x,max.x);this.y=clamp(this.y,min.y,max.y);return this}equals(v){return v.x===this.x&&v.y===this.y}setFromArray(array,offset){this.x=array[offset+0];this.y=array[offset+1]}toArray(array,offset){array[offset+0]=this.x;array[offset+1]=this.y}}function fetchImageElement(url,size=new Vector2){return new Promise((resolve,reject)=>{const image=new Image;if(size.x>0||size.y>0){image.width=size.x;image.height=size.y}image.crossOrigin="anonymous";image.addEventListener("load",()=>resolve(image));image.addEventListener("error",()=>{reject(new Error(`failed to load image: ${url}`))});image.src=url})}function fetchImageBitmap(url){return new Promise((resolve,reject)=>{fetch(url).then(response=>{if(response.status===200){return response.blob()}reject(`Unable to load resource with url ${url}`)}).then(blobData=>{if(blobData!==undefined){return createImageBitmap(blobData)}}).then(imageBitmap=>resolve(imageBitmap),err=>{reject(err)})})}function isImageBitmapSupported(){return"createImageBitmap"in window}function fetchImage(url){if(isImageBitmapSupported()&&!url.includes(".svg")){return fetchImageBitmap(url)}return fetchImageElement(url)}async function fetchCubeImages(urlPattern){const cubeMapFaces=["px","nx","py","ny","pz","nz"];const fetchPromises=[];cubeMapFaces.forEach(face=>{fetchPromises.push(fetchImage(urlPattern.replace("*",face)))});return Promise.all(fetchPromises)}exports.fetchCubeHDRs=fetchCubeHDRs;exports.fetchCubeImages=fetchCubeImages;exports.fetchHDR=fetchHDR;exports.fetchImage=fetchImage;exports.fetchImageBitmap=fetchImageBitmap;exports.fetchImageElement=fetchImageElement;exports.isImageBitmapSupported=isImageBitmapSupported;exports.parseHDR=parseHDR;return exports})({});