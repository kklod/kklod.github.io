define(["exports"],function(_exports){Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0;var UINT32_MAX=Math.pow(2,32)-1,MP4=function(){function MP4(){babelHelpers.classCallCheck(this,MP4)}return babelHelpers.createClass(MP4,null,[{key:"init",value:function(){var i;for(i in MP4.types={avc1:[],avcC:[],hvcC:[],hev1:[],btrt:[],dinf:[],dref:[],esds:[],ftyp:[],hdlr:[],mdat:[],mdhd:[],mdia:[],mfhd:[],minf:[],moof:[],moov:[],mp4a:[],".mp3":[],dac3:[],"ac-3":[],mvex:[],mvhd:[],pasp:[],sdtp:[],stbl:[],stco:[],stsc:[],stsd:[],stsz:[],stts:[],tfdt:[],tfhd:[],traf:[],trak:[],trun:[],trex:[],tkhd:[],vmhd:[],smhd:[]})MP4.types.hasOwnProperty(i)&&(MP4.types[i]=[i.charCodeAt(0),i.charCodeAt(1),i.charCodeAt(2),i.charCodeAt(3)]);var videoHdlr=new Uint8Array([0,0,0,0,0,0,0,0,118,105,100,101,0,0,0,0,0,0,0,0,0,0,0,0,86,105,100,101,111,72,97,110,100,108,101,114,0]),audioHdlr=new Uint8Array([0,0,0,0,0,0,0,0,115,111,117,110,0,0,0,0,0,0,0,0,0,0,0,0,83,111,117,110,100,72,97,110,100,108,101,114,0]);MP4.HDLR_TYPES={video:videoHdlr,audio:audioHdlr};var dref=new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,12,117,114,108,32,0,0,0,1]),stco=new Uint8Array([0,0,0,0,0,0,0,0]);MP4.STTS=MP4.STSC=MP4.STCO=stco,MP4.STSZ=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0]),MP4.VMHD=new Uint8Array([0,0,0,1,0,0,0,0,0,0,0,0]),MP4.SMHD=new Uint8Array([0,0,0,0,0,0,0,0]),MP4.STSD=new Uint8Array([0,0,0,0,0,0,0,1]);var majorBrand=new Uint8Array([105,115,111,109]),avc1Brand=new Uint8Array([97,118,99,49]),hev1Brand=new Uint8Array([104,101,118,49]),minorVersion=new Uint8Array([0,0,0,1]);MP4.FTYPHEV1=MP4.box(MP4.types.ftyp,majorBrand,minorVersion,majorBrand,hev1Brand),MP4.FTYP=MP4.box(MP4.types.ftyp,majorBrand,minorVersion,majorBrand,avc1Brand),MP4.DINF=MP4.box(MP4.types.dinf,MP4.box(MP4.types.dref,dref))}},{key:"box",value:function(type){for(var result,payload=Array.prototype.slice.call(arguments,1),size=8,i=payload.length,len=i;i--;)size+=payload[i].byteLength;for((result=new Uint8Array(size))[0]=size>>24&255,result[1]=size>>16&255,result[2]=size>>8&255,result[3]=255&size,result.set(type,4),i=0,size=8;i<len;i++)result.set(payload[i],size),size+=payload[i].byteLength;return result}},{key:"hdlr",value:function(type){return MP4.box(MP4.types.hdlr,MP4.HDLR_TYPES[type])}},{key:"mdat",value:function(data){return MP4.box(MP4.types.mdat,data)}},{key:"mdhd",value:function(timescale,duration){duration*=timescale;var upperWordDuration=Math.floor(duration/(1+UINT32_MAX)),lowerWordDuration=Math.floor(duration%(1+UINT32_MAX));return MP4.box(MP4.types.mdhd,new Uint8Array([1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,timescale>>24&255,timescale>>16&255,timescale>>8&255,255&timescale,upperWordDuration>>24,upperWordDuration>>16&255,upperWordDuration>>8&255,255&upperWordDuration,lowerWordDuration>>24,lowerWordDuration>>16&255,lowerWordDuration>>8&255,255&lowerWordDuration,85,196,0,0]))}},{key:"mdia",value:function(track){return MP4.box(MP4.types.mdia,MP4.mdhd(track.timescale,track.duration),MP4.hdlr(track.type),MP4.minf(track))}},{key:"mfhd",value:function(sequenceNumber){return MP4.box(MP4.types.mfhd,new Uint8Array([0,0,0,0,sequenceNumber>>24,sequenceNumber>>16&255,sequenceNumber>>8&255,255&sequenceNumber]))}},{key:"minf",value:function(track){return"audio"===track.type?MP4.box(MP4.types.minf,MP4.box(MP4.types.smhd,MP4.SMHD),MP4.DINF,MP4.stbl(track)):MP4.box(MP4.types.minf,MP4.box(MP4.types.vmhd,MP4.VMHD),MP4.DINF,MP4.stbl(track))}},{key:"moof",value:function(sn,baseMediaDecodeTime,track){return MP4.box(MP4.types.moof,MP4.mfhd(sn),MP4.traf(track,baseMediaDecodeTime))}},{key:"moov",value:function(tracks){for(var i=tracks.length,boxes=[];i--;)boxes[i]=MP4.trak(tracks[i]);return MP4.box.apply(null,[MP4.types.moov,MP4.mvhd(tracks[0].timescale,tracks[0].duration)].concat(boxes).concat(MP4.mvex(tracks)))}},{key:"mvex",value:function(tracks){for(var i=tracks.length,boxes=[];i--;)boxes[i]=MP4.trex(tracks[i]);return MP4.box.apply(null,[MP4.types.mvex].concat(boxes))}},{key:"mvhd",value:function(timescale,duration){duration*=timescale;var upperWordDuration=Math.floor(duration/(1+UINT32_MAX)),lowerWordDuration=Math.floor(duration%(1+UINT32_MAX)),bytes=new Uint8Array([1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,timescale>>24&255,timescale>>16&255,timescale>>8&255,255&timescale,upperWordDuration>>24,upperWordDuration>>16&255,upperWordDuration>>8&255,255&upperWordDuration,lowerWordDuration>>24,lowerWordDuration>>16&255,lowerWordDuration>>8&255,255&lowerWordDuration,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255]);return MP4.box(MP4.types.mvhd,bytes)}},{key:"sdtp",value:function(track){for(var flags,samples=track.samples||[],bytes=new Uint8Array(4+samples.length),i=0;i<samples.length;i++)flags=samples[i].flags,bytes[i+4]=flags.dependsOn<<4|flags.isDependedOn<<2|flags.hasRedundancy;return MP4.box(MP4.types.sdtp,bytes)}},{key:"stbl",value:function(track){return MP4.box(MP4.types.stbl,MP4.stsd(track),MP4.box(MP4.types.stts,MP4.STTS),MP4.box(MP4.types.stsc,MP4.STSC),MP4.box(MP4.types.stsz,MP4.STSZ),MP4.box(MP4.types.stco,MP4.STCO))}},{key:"hev1",value:function(track){var i,data,len,vps=[],sps=[],pps=[];for(vps.push(0),vps.push(0),vps.push(track.vps.length),i=0;i<track.vps.length;i++)len=(data=track.vps[i]).byteLength,vps.push(len>>>8&255),vps.push(255&len),vps=vps.concat(Array.prototype.slice.call(data));for(sps.push(0),sps.push(0),sps.push(track.sps.length),i=0;i<track.sps.length;i++)len=(data=track.sps[i]).byteLength,sps.push(len>>>8&255),sps.push(255&len),sps=sps.concat(Array.prototype.slice.call(data));for(pps.push(0),pps.push(0),pps.push(track.pps.length),i=0;i<track.pps.length;i++)len=(data=track.pps[i]).byteLength,pps.push(len>>>8&255),pps.push(255&len),pps=pps.concat(Array.prototype.slice.call(data));var iNumArrays=track.vps.length+track.sps.length+track.pps.length,hvcc=MP4.box(MP4.types.hvcC,new Uint8Array([1,0,0,0,0,0,0,0,0,0,0,0,0,240,0,252|3&track.chromaFormatIdc,248|7&track.bitDepthLumaMinus8,248|7&track.bitDepthChromaMinus8,0,0,0,iNumArrays].concat(vps).concat(sps).concat(pps)));return MP4.box(MP4.types.hev1,new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,track.width>>8&255,255&track.width,track.height>>8&255,255&track.height,0,72,0,0,0,72,0,0,0,0,0,0,0,1,18,100,97,105,108,121,109,111,116,105,111,110,47,104,108,115,46,106,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,17,17]),hvcc,MP4.box(MP4.types.btrt,new Uint8Array([0,28,156,128,0,45,198,192,0,45,198,192])))}},{key:"avc1",value:function(track){for(var data,len,sps=[],pps=[],i=0;i<track.sps.length;i++)len=(data=track.sps[i]).byteLength,sps.push(len>>>8&255),sps.push(255&len),sps=sps.concat(Array.prototype.slice.call(data));for(i=0;i<track.pps.length;i++)len=(data=track.pps[i]).byteLength,pps.push(len>>>8&255),pps.push(255&len),pps=pps.concat(Array.prototype.slice.call(data));var avcc=MP4.box(MP4.types.avcC,new Uint8Array([1,sps[3],sps[4],sps[5],255,224|track.sps.length].concat(sps).concat([track.pps.length]).concat(pps))),width=track.width,height=track.height,hSpacing=track.pixelRatio[0],vSpacing=track.pixelRatio[1],avcc=MP4.box(MP4.types.avcC,track.avcc);return MP4.box(MP4.types.avc1,new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,width>>8&255,255&width,height>>8&255,255&height,0,72,0,0,0,72,0,0,0,0,0,0,0,1,18,100,97,105,108,121,109,111,116,105,111,110,47,104,108,115,46,106,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,17,17]),avcc,MP4.box(MP4.types.btrt,new Uint8Array([0,28,156,128,0,45,198,192,0,45,198,192])),MP4.box(MP4.types.pasp,new Uint8Array([hSpacing>>24,hSpacing>>16&255,hSpacing>>8&255,255&hSpacing,vSpacing>>24,vSpacing>>16&255,vSpacing>>8&255,255&vSpacing])))}},{key:"esds",value:function(track){var configlen=track.config.length;return new Uint8Array([0,0,0,0,3,23+configlen,0,1,0,4,15+configlen,64,21,0,0,0,0,0,0,0,0,0,0,0,5].concat([configlen]).concat(track.config).concat([6,1,2]))}},{key:"dac3",value:function(track){var extraData=track.extraData;return new Uint8Array([extraData>>16&255,extraData>>8&255,255&extraData])}},{key:"audioStsd",value:function(track){var samplerate=track.samplerate;return new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,track.channelCount,0,16,0,0,0,0,samplerate>>8&255,255&samplerate,0,0])}},{key:"mp4a",value:function(track){return MP4.box(MP4.types.mp4a,MP4.audioStsd(track),MP4.box(MP4.types.esds,MP4.esds(track)))}},{key:"mp3",value:function(track){return MP4.box(MP4.types[".mp3"],MP4.audioStsd(track))}},{key:"ac3",value:function(track){return MP4.box(MP4.types["ac-3"],MP4.audioStsd(track),MP4.box(MP4.types.dac3,MP4.dac3(track)))}},{key:"stsd",value:function(track){return"audio"===track.type?"mp3"===track.segmentCodec&&"mp3"===track.codec?MP4.box(MP4.types.stsd,MP4.STSD,MP4.mp3(track)):"ac3"===track.segmentCodec?MP4.box(MP4.types.stsd,MP4.STSD,MP4.ac3(track)):MP4.box(MP4.types.stsd,MP4.STSD,MP4.mp4a(track)):36===track.streamType?MP4.box(MP4.types.stsd,MP4.STSD,MP4.hev1(track)):MP4.box(MP4.types.stsd,MP4.STSD,MP4.avc1(track))}},{key:"tkhd",value:function(track){var id=track.id,duration=track.duration*track.timescale,width=track.width,height=track.height,upperWordDuration=Math.floor(duration/(1+UINT32_MAX)),lowerWordDuration=Math.floor(duration%(1+UINT32_MAX));return MP4.box(MP4.types.tkhd,new Uint8Array([1,0,0,7,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,id>>24&255,id>>16&255,id>>8&255,255&id,0,0,0,0,upperWordDuration>>24,upperWordDuration>>16&255,upperWordDuration>>8&255,255&upperWordDuration,lowerWordDuration>>24,lowerWordDuration>>16&255,lowerWordDuration>>8&255,255&lowerWordDuration,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,width>>8&255,255&width,0,0,height>>8&255,255&height,0,0]))}},{key:"traf",value:function(track,baseMediaDecodeTime){var sampleDependencyTable=MP4.sdtp(track),id=track.id,upperWordBaseMediaDecodeTime=Math.floor(baseMediaDecodeTime/(1+UINT32_MAX)),lowerWordBaseMediaDecodeTime=Math.floor(baseMediaDecodeTime%(1+UINT32_MAX));return MP4.box(MP4.types.traf,MP4.box(MP4.types.tfhd,new Uint8Array([0,0,0,0,id>>24,id>>16&255,id>>8&255,255&id])),MP4.box(MP4.types.tfdt,new Uint8Array([1,0,0,0,upperWordBaseMediaDecodeTime>>24,upperWordBaseMediaDecodeTime>>16&255,upperWordBaseMediaDecodeTime>>8&255,255&upperWordBaseMediaDecodeTime,lowerWordBaseMediaDecodeTime>>24,lowerWordBaseMediaDecodeTime>>16&255,lowerWordBaseMediaDecodeTime>>8&255,255&lowerWordBaseMediaDecodeTime])),MP4.trun(track,sampleDependencyTable.length+16+20+8+16+8+8),sampleDependencyTable)}},{key:"trak",value:function(track){return track.duration=track.duration||4294967295,MP4.box(MP4.types.trak,MP4.tkhd(track),MP4.mdia(track))}},{key:"trex",value:function(track){var id=track.id;return MP4.box(MP4.types.trex,new Uint8Array([0,0,0,0,id>>24,id>>16&255,id>>8&255,255&id,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1]))}},{key:"trun",value:function(track,offset){var i,sample,duration,size,flags,cts,samples=track.samples||[],len=samples.length,arraylen=12+16*len,array=new Uint8Array(arraylen);for(offset+=8+arraylen,array.set([0,0,15,1,len>>>24&255,len>>>16&255,len>>>8&255,255&len,offset>>>24&255,offset>>>16&255,offset>>>8&255,255&offset],0),i=0;i<len;i++)duration=(sample=samples[i]).duration,size=sample.size,flags=sample.flags,cts=sample.cts,array.set([duration>>>24&255,duration>>>16&255,duration>>>8&255,255&duration,size>>>24&255,size>>>16&255,size>>>8&255,255&size,flags.isLeading<<2|flags.dependsOn,flags.isDependedOn<<6|flags.hasRedundancy<<4|flags.paddingValue<<1|flags.isNonSync,61440&flags.degradPrio,15&flags.degradPrio,cts>>>24&255,cts>>>16&255,cts>>>8&255,255&cts],12+16*i);return MP4.box(MP4.types.trun,array)}},{key:"initSegment",value:function(tracks){MP4.types||MP4.init();var result,movie=MP4.moov(tracks);return tracks.length&&"video"===tracks[0].type&&36===tracks[0].streamType?((result=new Uint8Array(MP4.FTYPHEV1.byteLength+movie.byteLength)).set(MP4.FTYPHEV1),result.set(movie,MP4.FTYPHEV1.byteLength)):((result=new Uint8Array(MP4.FTYP.byteLength+movie.byteLength)).set(MP4.FTYP),result.set(movie,MP4.FTYP.byteLength)),result}}]),MP4}();_exports.default=MP4});