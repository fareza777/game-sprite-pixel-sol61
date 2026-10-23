import {grid,line,poly,rect,ellipse} from './art-lib.mjs';

// Screen-space keys are deliberately drawn, not interpolated or rotated sprites.
// A boot sole is at y=75. Head, cuirass, hips, limbs, fist, grip and blade overlap.
export const HERO_TIMES={idle:[240,180,240,340],walk:[90,60,60,70,90,60,60,70],attack:[35,40,35,35,85,50,55,60,65],'attack-backhand':[35,35,40,35,85,50,55,60,65],'attack-heavy':[50,60,60,45,100,70,70,65,60],roll:[35,45,50,55,55,60],block:[70,80,180,240],hurt:[65,65,75,95],death:[80,90,90,100,100,120,500]};
export const ENEMY_TIMES={idle:[240,180,240,340],walk:[130,90,80,100,130,90,80,100],attack:[120,150,150,45,90,80,100,100,100],hurt:[55,70,80,95],death:[80,90,90,100,100,120,500]};
const HEAD={
 s:['....sssss....','...slLLLss...','..slHHHLLms..','.slHHHHLLmss.','slLHHHLLLmmms','slLIIIIIIImms','slLmmLImmmmms','slLmmLImIImms','.sLmmLImIImsI','.slmmLImmmss.','..smmLImmss..','...sssssss...'],
 n:['....sssss....','...slLLLss...','..slHHHLLms..','.slHHHHLLmss.','slLHHHLLLmmms','slLLLLLLLmmms','slLmmmmmmmsms','slLmmmmmmmsms','.sLmmmmmmsmsI','.slmmmmmmsss.','..smmmmmsss..','...sssssss...'],
 e:['...sssss.....','..slLLLss....','.slHHHLLms...','slLHHHHLLmss.','slLHHHLLLmmss','slLLLLIIIIIIs','slLmmmLmmmmms','slLmmmLmmIImI','.sLmmmLmmIImI','.slmmmLmmmsI.','..smmmLmmss..','...sssssss...'],
 w:['.....sssss...','....slLLLss..','...slHHHLLms.','.sslHHHHLLmms','sslLHHHLLmmms','sIIIIIIILmmms','sLmmmmLmmmmms','ImIImmLmmmmms','ImIImmLmmmms.','.IsmmmLmmms..','..ssmmLmmss..','...sssssss...']
};
// Reference: the user's front/side great-helm knight in Isprite Asset/vibe_images.
// A smaller, flat-topped helm, neutral steel, golden tabard and leather boots.
HEAD.s=['...ssssssss...','..slHHHLLmmss.','.slHLLLLLLmmsI','.sLLLLLlmLmmss','slLnnnnnnnmmss','slLnnnnnnnmmss','slLLmmLmmmmmsI','slLLmmLmmnmmss','slLLmmLmnmnmss','slLLmmLmmnmmss','slLLmmLmnmnmss','.sLLmmLmmmmmss','.slLmmLmmmmssI','..slLmLmmmssI.','...smmLmmssI..','....sssssII...'];
HEAD.n=['...ssssssss...','..slHHHLLmmss.','.slHLLLLLLmmsI','.sLLLLLlmLmmss','slLLmmmLmmmmss','slLLmmmLmmmmss','slLLmmmLmmmmss','slLLmmmLmmmmss','slLLmmmLmmmmss','slLLmmmLmmmmss','slLLmmmLmmmmss','.sLLmmmLmmmssI','.slLmmmLmmssI.','..slLmmLmmssI.','...smmmLmsII..','....sssssII...'];
HEAD.e=['...ssssss.....','..slHHLLmss...','.slHLLLLmmsI..','.sLLLLLLmmss..','slLmmLnnnnnnns','slLmmLnnnnnnns','slLmmLmmmmmmsI','slLmmLmmnmnmss','slLmmLmnmnmmss','slLmmLmmnmnmss','.sLmmLmmmmmmss','.sLmmLmmmmmmss','..smmLmmmmmssI','...smLmmmmssI.','....smmmmssI..','.....sssssI...'];
HEAD.w=['.....ssssss...','...sslHHLLms..','..IsmLLLLHLms.','..ssmmLLLLLLs.','snnnnnnnLmmLls','snnnnnnnLmmLls','IsmmmmmmLmmLls','ssmnmnmmLmmLls','ssmmnmnmLmmLls','ssmnmnmmLmmLls','ssmmmmmmLmmLs.','ssmmmmmmLmmLs.','IssmmmmmLmms..','.IssmmmmLms...','..Issmmmms....','...Isssss.....'];
const CHEST={
 s:['.....sssssssss.....','...sslLHHHLLmmss...','..slLHHHHHHLLmmss..','.slLHHHHLLLLLmmmss.','slLHHLLLLLLLLmmmmss','slLLLLmmLLLmmmmmssI','.sLLLmmLLLmmmmmssI.','..sLLmLLLmmmmmssI..','...sLLmLLmLmmmss...','...smmLLLmmmmssI...','...OAAAAAAAOOooI...','...OAyyAAAOoooII...','..smmssmssmssmmsI..','..smmmsmmsmmsmmsI..','...smmmrrrrmmmss...','....ssrrArrrssI....','.....crrArrccI.....'],
 n:['.....sssssssss.....','...sslLHHHLLmmss...','..slLHHHHHHLLmmss..','.slLHHHHLLLLLmmmss.','slLHHLLLLLLLLmmmmss','slLLLLrrrrrrrrmmssI','.sLLrRRRrrrrrrmssI.','..srrRRRrrrrrrrssI.','...crRRRrrrrrrrc...','...crRRRrrrrrrrc...','...crRRRrrrrrrrc...','..crRRRRrrrrrrrcc..','..crRRRrrrrrrrrcc..','..crRRRrrrrrrrrcc..','...crRRrrrrrrrcc...','....ccrrrcccccc....','.....ccccccccc.....'],
 e:['.....sssssss.......','....slLHHLLmss.....','...slLHHHHLLmmss...','..slLHHHHLLLmmmss..','.slLHHLLLLLmmmmssI.','slLLLLLLLLmmmmssI..','slLLLLmmLmmmmssI...','.sLLLmmLLmmmssI....','..sLLmLLLmmmssI....','...sLLmLLmmmssI....','...OAAAAAAOOooI....','...OAyyAAOoooII....','...smmssmssmmsI....','...smmmsmmsmmsI....','....smmmrrrmmss....','.....ssrrArrssI....','......crrArrcI.....'],
 w:['.......sssssss.....','.....sslLHHLLms....','...sslLHHHHLLmms...','..sslLHHHHLLLmmms..','.IssllLHHLLLLmmmms.','..IssmLLLLLLLLmmms.','...IssmLLmmLLLLmms.','....IssmmmLLmmLms..','....IssmmmLLLmms...','....IssmmmLLmms....','....IooOOAAAAAAO...','....IIoooOAAyyAO...','....Ismmssmssmms...','....Ismmsmmsmmms...','....ssmmrrrmmms....','....IssrrArrss.....','.....IcrrArrc......']
};
CHEST.s=['.....sssssssss.....','...sslLHHHLLmmss...','..slLHHHHHHLLmmss..','.slLHHHHLLLLLmmmss.','slLHHLLLLLLLLmmmmss','slLLLLmmLLLmmmmmssI','.sLLLmmLLLmmmmmssI.','..sLLmLLLmmmmmssI..','..sLLmLLLmmmmmmss..','...sLLmLLmLmmmss...','...sLLmLLLmmmmss...','....smmLLLmmmssI...','....smmLLmmmmssI...','....smmmLmmmmssI...','....smmmmmmmmssI...','....WWWWOAAOWWWW...','....oWWWOOOOWWWw...','...smmssmssmssmms..','..slLmmssmssmLmmss.','..smmmsrrrrrsmmmss.','...sssrrrrrrrsssI..','.....crrArrccI.....'];
CHEST.n=[...CHEST.n.slice(0,9),'...crRRRrrrrrrrc...','...crRRRrrrrrrrc...','...crRRRrrrrrrrc...','...crRRRrrrrrrrc...','...crRRRrrrrrrrc...','...crRRRrrrrrrrc...','...WWWWWOAAOWWWW...','...oWWWWOOOOWWWW...','..crRRRRrrrrrrrcc..','..crRRRrrrrrrrrcc..','...crRRrrrrrrrcc...','....ccrrrcccccc....','.....ccccccccc.....'];
CHEST.e=[...CHEST.e.slice(0,10),'...sLLmLLmmmssI....','...sLLmLLmmmssI....','....sLmmmmmmssI....','....sLmmmmmmssI....','....smmmmmmmssI....','....WWWWOAAOWWw....','....oWWWOOOOWWw....','...smmssmssmmsI....','...slLmmrrrmmsI....','....smmrrArrssI....','.....ssrrArrssI....','......crrArrcI.....'];
CHEST.w=[...CHEST.w.slice(0,10),'....IssmmmLLmms....','....IssmmmLLmms....','....IssmmmmmmLs....','....IssmmmmmmLs....','....Issmmmmmmms....','....wWWOAAOWWWW....','....wWWOOOOWWWo....','....Ismmssmssmms...','....IsmmrrrmmLls...','....IssrrArrmms....','....IssrrArrss.....','.....IcrrArrc......'];
// Curved breastplate, a visible gorget, four fauld plates and separate tassets.
CHEST.s=['......sssssss........','....sslLLLmmsss......','...slLmnnnnmLmss.....','..slLHHLLLLLLLmmss...','.slLHHHHLLLmmLLmmss..','slLHHLLlLmmmmLLmmmssI','sLLHLLLmmLmmmLmmmmssI','.sLLLmmmmlLmLmmmmssI.','..sLLLmmmmLLmmmmssI..','..sLLLmmmmLLmmmmssI..','...sLLLmmLLmmmmssI...','...sLLLLLLmmmmssI....','....sLLLLmmmmssI.....','....sllllllllssI.....','....sLmmmmmmmssI.....','....sllLLLLllssI.....','...WWWWWOAAOWWWW.....','...oWWWOOyyOOWWw.....','..slLmmssmssmLmmss...','..sLLmmssmssmLmmmss..','..slLmsrrrrrsmmmmss..','...sssrrrrrrrssssI...'];
CHEST.e=['......sssssss........','.....slLLLmmss.......','....slLmnnmLmss......','...slLHHLLLLmmss.....','..slLHHHLLLmmLmss....','.slLHHLLLmmmLLmssI...','slLHHLLmmmmLLmmssI...','sLLHLLmmmmLLmmmssI...','.sLLLmmmmmLLmmssI....','..sLLLmmmmLmmmssI....','...sLLLmmLLmmmssI....','...sLLLLLLmmmssI.....','....sLLLLmmmmssI.....','....slllllllssI......','....sLmmmmmmssI......','....sllLLLllssI......','...WWWWOAAOWWWW......','...oWWOOyyOOWWw......','...slLmmssmssmssI....','...sLLmmssmssmmsI....','....slLmsrrrmmsI.....','.....sssrrArrssI.....'];
CHEST.w=CHEST.e.map(r=>r.split('').reverse().join(''));
const CREST=[
 ['....cccccccccc..','..ccRERRRrrrccc.','.cRRERRrrrrccc..','crRRRrrrrccc....','ccccrrrccc.....','....cccc.......'],
 ['.....ccccccccc..','...ccRERRRrrrcc.','..cRRERRrrrrccc.','.crRRRrrrrccc...','.ccccrrrccc.....','.....cccc.......'],
 ['....ccccccccccc.','..ccRERRRRrrrccc','.cRRERRRrrrrccc.','crRRRrrrrrccc...','ccccrrrrccc.....','....cccc........'],
 ['...ccccccccccc..','.ccRRERRRrrrccc.','ccRRERRrrrrccc..','cccRRrrrrccc....','.ccccrrrccc.....','....cccc........']
];
const CLOAK=[
 ['.....ccccccccccc.....','...ccrRRRrrrrrrccc...','..crRRRRRrrrrrrcccc..','.crRRRRrrrrrrrrrcccI.','crRRRRrrrrrrrrrrccccI','crRRRrrrrrrrrrrrccccI','.crRRrrrrrrrrrrccccI.','..crRRrrrrrrrrrccccI.','..crRRrrrrrrrrcccccI.','.crRRrrrrrrrrrcccccI.','crRRrrrrrrrrrccccccI.','crRrrrrrrrrrrcccccI..','.ccrrrrccccrrcccccI..','..cccccI..cccccccI...','...cccI....ccccI....'],
 ['.....ccccccccccc.....','...ccrRRRRrrrrrccc...','..crRRRRRRrrrrrcccc..','.crRRRRRrrrrrrrrcccI.','crRRRRrrrrrrrrrrccccI','crRRRRrrrrrrrrrrccccI','.crRRRrrrrrrrrrccccI.','..crRRrrrrrrrrrccccI.','...crRRrrrrrrrrccccI.','...crRRrrrrrrrrccccI.','..crRRrrrrrrrrcccccI.','..crRrrrrrrrrrcccccI.','...ccrrrrccccrccccI..','....cccccI.ccccccI...','.....cccI...ccccI...'],
 ['......cccccccccc.....','....ccrRRRRrrrrccc...','...crRRRRRRrrrrcccc..','..crRRRRRrrrrrrrcccI.','.crRRRRRrrrrrrrrccccI','.crRRRRrrrrrrrrrccccI','..crRRRrrrrrrrrccccI.','...crRRrrrrrrrrccccI.','....crRRrrrrrrrccccI.','....crRRrrrrrrrccccI.','...crRRrrrrrrrcccccI.','...crRrrrrrrrrcccccI.','....ccrrrrcccrccccI..','.....ccccccccccccI...','......ccccccccccI...'],
 ['....cccccccccccc.....','..ccrRRRRrrrrrrccc...','.crRRRRRrrrrrrrcccc..','crRRRRRrrrrrrrrrcccI.','crRRRRrrrrrrrrrrccccI','crRRRrrrrrrrrrrrccccI','crRRRrrrrrrrrrrccccI.','.crRRrrrrrrrrrrccccI.','.crRRrrrrrrrrrcccccI.','crRRrrrrrrrrrrcccccI.','crRRrrrrrrrrrccccccI.','crRrrrrrrrrrrcccccI..','.ccrrrrccccrrccccI...','..cccccI..ccccccI....','...cccI....ccccI....']
];
const SHIELD=['....sssssss.....','..sslHHLLLmss...','.slHLLLlllLLmss.','slHLOAAAAAOLmmss','sHLOAyAAAAAOLmss','sLLOAyyIAAAOLmss','sLLOAyIIIAAOLmss','sLLOAIIIIIAOLmss','sLLOIIIIIIIOlmss','sLLOAIIIIIAOlmss','sLLOAIIIIIAOlmss','sLLOAyIIIAAOlmss','.sLOAAIIIAOlmmss','.sLOAyIIAAOlmssI','..sLOAAIAOlmmssI','..sLOAAAAOlmssI.','...sLOAAOlmmssI.','....sLOOlmmssI..','.....sLlmmssI...','......slmssI....','.......sssI.....','........II......'];
const SHIELD_SIDE=['...sss...','..sHLms..','.sHLAmsI.','sHLOAmsI.','sHLOAmsI.','sLLOAmsI.','sLLOAmsI.','sLLOAmsI.','sLLOAmsI.','sLLOAmsI.','sLLOAmsI.','.sLOAmsI.','.sLOAmsI.','..sLAmsI.','..sLAmsI.','...sLmsI.','...sLmsI.','....smsI.','.....sI..'];
const SHIELD_BACK=['..sssssssss..','.slWWWWWWWms.','slWooWWoooWms','sWooWWWWoooWs','sWOOOOOOOOOWs','sWooWOOoooWWs','sWooWOOoooWWs','sWooWWWWooWWs','.sWWWWWWWWssI','.sWWWWWWWssI.','..sWWWWWssI..','..sWWWWWssI..','...sWWWssI...','....sWssI....','.....ssI.....'];
const FIST=['.ssss.','slLLms','slLsms','sLmsms','.smmss','..III.'];
const KNEE=['...s...','..sLs..','.sLHLs.','slLHmms','.slLmss','..sssI.'];
const TOE={s:['..sssss..','.slLLmms.','slLLmmmms','smmmmmmmI','IIIIIIIII'],n:['..sssss..','.smmmmmI.','smmLmLmmI','smmmmmmmI','IIIIIIIII'],e:['.ssss....','slLmmss..','slLmmmmss','smmmmmmmI','IIIIIIIII'],w:['....ssss.','..sslLmms','sslLmmmms','smmmmmmmI','IIIIIIIII']};
const BOOT_LEATHER={s:['..oWWWW..','.oOOooWW.','oOOoWWWWW','oOOOOooWW','IIIIIIIII'],n:['..WWWWW..','.WooWWWW.','WoooWoWWI','WoooooWWI','IIIIIIIII'],e:['.oWWWW...','oOOoWWWW.','oOOooWWWW','oOOOOooWW','IIIIIIIII'],w:['...WWWWo.','.WWWWoOOo','WWWWooOOo','WWooOOOOo','IIIIIIIII']};
const LEGS_IDLE={s:[[43,54,42,64,42,71],[54,54,55,64,55,71]],n:[[43,54,42,64,42,71],[54,54,55,64,55,71]],e:[[45,54,46,63,43,71],[52,54,54,64,56,71]],w:[[44,54,42,64,40,71],[51,54,51,63,53,71]]};
// Contact / down / passing / up for each leg. At least one sole stays at 75.
const WALK={
 s:[[[43,54,40,64,40,71],[54,54,56,61,56,67]],[[43,55,41,64,41,71],[54,55,54,61,54,66]],[[43,54,43,63,43,71],[54,54,52,62,53,68]],[[43,53,43,62,44,69],[54,53,54,64,55,71]],[[43,54,41,61,41,67],[54,54,57,64,57,71]],[[43,55,43,61,43,66],[54,55,56,64,56,71]],[[43,54,45,62,44,68],[54,54,54,63,54,71]],[[43,53,42,64,41,71],[54,53,54,62,53,69]]],
 e:[[[44,54,51,62,60,71],[52,54,44,61,36,68]],[[44,55,48,63,55,71],[52,55,46,61,39,66]],[[44,54,45,63,48,71],[52,54,48,60,49,65]],[[44,53,42,62,40,71],[52,53,55,60,58,68]],[[44,54,41,61,36,68],[52,54,56,63,62,71]],[[44,55,43,61,40,66],[52,55,54,64,57,71]],[[44,54,46,60,48,65],[52,54,51,63,50,71]],[[44,53,49,60,55,68],[52,53,47,62,43,71]]]
};
const ATTACK={
 // shoulder, elbow, fist, sword tip, shield fist, lean x/y, torso facing.
 s:[ [39,41,34,43,32,47,31,24,61,51,-1,0,'s'],[39,41,32,36,31,31,27,10,59,49,-2,1,'w'],[41,42,34,34,39,29,49,11,59,49,-1,1,'s'],[43,43,46,49,53,55,77,71,60,49,1,2,'e'],[44,43,55,48,64,54,80,74,60,49,2,2,'e'],[44,44,57,53,62,59,62,87,58,50,2,2,'s'],[42,43,48,53,50,57,42,80,60,51,1,1,'s'],[40,42,37,49,36,53,32,31,61,52,0,1,'s'],[39,41,35,47,33,51,33,27,61,52,0,0,'s'] ],
 n:[ [58,41,62,45,62,48,66,25,35,50,1,0,'n'],[58,41,65,34,64,31,70,9,36,49,2,1,'e'],[56,42,62,32,57,29,45,10,36,49,1,1,'n'],[54,42,49,35,42,34,23,13,35,49,-1,1,'w'],[53,42,43,35,35,36,14,24,35,49,-2,1,'w'],[53,43,43,41,36,44,17,49,36,50,-2,1,'n'],[55,42,49,45,48,46,35,58,35,51,-1,1,'n'],[57,41,59,46,61,49,65,28,35,51,0,0,'n'],[58,41,62,46,62,50,65,26,35,50,0,0,'n'] ],
 e:[ [55,42,58,46,60,50,65,27,46,48,-1,0,'e'],[55,41,54,37,51,33,32,15,46,47,-2,1,'s'],[56,41,55,32,56,30,64,9,46,47,-1,1,'e'],[57,42,63,43,68,45,92,41,48,48,1,1,'e'],[58,43,64,48,71,51,94,55,48,49,2,2,'e'],[58,44,63,54,67,58,83,78,47,49,2,2,'s'],[57,43,59,54,60,58,60,81,46,49,1,1,'e'],[56,42,57,50,59,53,64,30,46,48,0,1,'e'],[55,42,58,47,60,51,65,28,46,48,0,0,'e'] ],
 w:[ [41,42,38,46,36,50,31,27,51,51,1,0,'w'],[41,41,42,37,45,33,64,15,51,50,2,1,'s'],[40,41,41,32,40,30,32,9,51,50,1,1,'w'],[39,42,33,43,28,45,4,41,49,51,-1,1,'w'],[38,43,32,48,25,51,2,55,49,52,-2,2,'w'],[38,44,33,54,29,58,13,78,50,52,-2,2,'s'],[39,43,37,54,36,58,36,81,51,52,-1,1,'w'],[40,42,39,50,37,53,32,30,51,51,0,1,'w'],[41,42,38,47,36,51,31,28,51,51,0,0,'w'] ]
};
const BACK={
 s:[[39,41,35,47,33,51,33,27],[40,41,46,39,54,34,69,15],[42,41,52,36,59,36,81,27],[42,43,48,50,46,56,26,75],[41,44,37,54,32,58,12,77],[40,44,34,55,31,60,30,87],[39,43,35,52,35,55,25,74],[39,42,35,48,34,52,31,30],[39,41,35,47,33,51,33,27]],
 e:[[55,42,58,47,60,51,65,28],[55,42,61,51,64,57,49,78],[56,42,64,50,69,54,77,77],[57,42,64,42,70,40,94,26],[58,42,64,38,68,35,90,16],[57,42,59,35,59,32,57,9],[56,42,56,40,56,43,45,24],[55,42,58,46,60,50,63,28],[55,42,58,47,60,51,65,28]],
 n:[[58,41,62,46,62,50,65,26],[57,41,48,42,43,42,24,53],[55,41,43,38,37,37,16,36],[54,42,48,34,53,30,72,12],[55,42,58,32,64,32,86,20],[56,43,62,39,66,42,89,47],[57,42,61,45,63,48,77,60],[58,41,62,46,62,50,65,28],[58,41,62,46,62,50,65,26]],
 w:[[41,42,38,47,36,51,31,28],[41,42,35,51,32,57,47,78],[40,42,32,50,27,54,19,77],[39,42,32,42,26,40,2,26],[38,42,32,38,28,35,6,16],[39,42,37,35,37,32,39,9],[40,42,40,40,40,43,51,24],[41,42,38,46,36,50,33,28],[41,42,38,47,36,51,31,28]]
};
const HEAVY={
 s:[[39,41,35,47,33,51,33,27],[39,41,32,34,35,29,31,9],[40,41,38,30,44,27,46,5],[42,43,44,38,47,43,51,70],[43,44,47,49,49,55,51,91],[43,44,48,54,49,59,50,92],[41,43,42,53,42,56,40,80],[40,42,36,49,35,53,32,32],[39,41,35,47,33,51,33,27]],
 e:[[55,42,58,47,60,51,65,28],[55,41,54,33,51,28,43,7],[56,41,56,30,58,26,63,4],[57,43,63,41,68,42,90,50],[58,44,64,49,70,54,91,73],[58,44,64,55,68,59,81,88],[57,43,59,54,60,58,62,82],[56,42,58,50,60,53,65,31],[55,42,58,47,60,51,65,28]],
 n:[[58,41,62,46,62,50,65,26],[58,41,65,34,63,28,70,8],[57,41,61,29,55,26,51,4],[55,42,51,32,48,30,44,7],[54,43,47,36,42,35,27,15],[54,43,43,42,38,43,18,30],[56,42,50,46,48,47,35,61],[57,41,59,47,61,50,65,28],[58,41,62,46,62,50,65,26]],
 w:[[41,42,38,47,36,51,31,28],[41,41,42,33,45,28,53,7],[40,41,40,30,38,26,33,4],[39,43,33,41,28,42,6,50],[38,44,32,49,26,54,5,73],[38,44,32,55,28,59,15,88],[39,43,37,54,36,58,34,82],[40,42,38,50,36,53,31,31],[41,42,38,47,36,51,31,28]]
};
export function offsetOps(ops,dx,dy){
 return ops.map(o=>{o=structuredClone(o);if(o.kind==='grid'){o.x+=dx;o.y+=dy;}if(o.rect){o.rect.x+=dx;o.rect.y+=dy;}if(o.from?.x!==undefined){o.from.x+=dx;o.from.y+=dy;o.to.x+=dx;o.to.y+=dy;}if(o.points)for(const p of o.points){p.x+=dx;p.y+=dy;}return o;});
}
export function streak(points,color,width=3){return points.slice(1).map((p,i)=>line(...points[i],...p,color,width));}
export function armorArm(shoulder,elbow,hand,{bone=false,large=false,far=false}={}){
 const [sx,sy]=shoulder,[ex,ey]=elbow,[hx,hy]=hand,th=large?8:bone?4:6;
 const dark=bone?'s':'I',mid=bone?'q':far?'s':'m',bright=bone?'H':far?'m':'L';
 const ops=[line(sx,sy,ex,ey,dark,th),line(ex,ey,hx,hy,dark,large?7:bone?4:5),line(sx,sy,ex,ey,mid,th-2),line(ex,ey,hx,hy,mid,large?5:bone?2:3),line(sx-1,sy-1,ex-1,ey-1,bright,large?3:bone?1:2),line(ex-1,ey-1,hx-1,hy-1,bright,large?2:1)];
 ops.push(grid(ex-2,ey-2,bone?['.qq.','qHQq','.qq.']:['.sss.','slLms','slmms','.sssI']));
 if(!bone){
  ops.push(grid(sx-5,sy-4,large?['..sssssss..','.slLHHLLmss','slLHHHLLmms','slLLLLLmmms','.sLmmmmmmss','..ssssssssI']:['...ssssss..','..slHHLLmss','.slHHLLLmmss','slHLLLLLLmss','sLLLLLmmmssI','.sllllllssI.','..smmmmssI..','...sssssI...']));
  const bx=Math.round((ex+hx)/2),by=Math.round((ey+hy)/2);
  ops.push(line(bx-2,by,bx+2,by,'s',2),line(bx-2,by-1,bx,by-1,'H'));
 }
 return ops;
}
export function gauntlet(hx,hy,bone=false){return grid(hx-2,hy-2,bone?['.qqq.','qHHQq','qQqqq','.qqqI','..II.']:FIST);}
export function blade(hand,tip,{bone=false,resting=false}={}){
 const [x,y]=hand,[tx,ty]=tip,norm=Math.max(1,Math.hypot(tx-x,ty-y)),ux=(tx-x)/norm,uy=(ty-y)/norm,px=-uy,py=ux;
 const at=(along,side=0)=>[Math.round(x+ux*along+px*side),Math.round(y+uy*along+py*side)];
 const half=resting?1:2,pointLength=resting?5:7,base=4,shoulder=norm-pointLength;
 // A long triangular taper terminates in ONE pixel. No brush cap is used at the point.
 const outline=[at(base,-half),at(shoulder,-half),[tx,ty],at(shoulder,half),at(base,half)];
 const bright=[at(base,-half+1),at(shoulder,-half+1),[tx,ty],at(base,0)];
 const g=at(base),gl=at(base,-(resting?2:3)),gr=at(base,resting?2:3),pommel=at(-3);
 return [
  line(...at(-3),...g,'I',3),line(...at(-2),...g,'W',2),
  poly(outline,'I',bone?'m':'l'),poly(bright,bone?'l':'L',bone?'l':'L'),
  line(...at(base),...at(norm-2),'H'),rect(tx,ty,1,1,'H'),
  line(...gl,...gr,'I',3),line(...gl,...gr,bone?'m':'O'),
  rect(gl[0],gl[1],1,1,'A'),rect(gr[0],gr[1],1,1,'A'),
  grid(pommel[0]-1,pommel[1]-1,['.O.','OAO','.O.'])
 ];
}
function leg(seg,d,{bone=false,large=false,back=false}={}){
 const [hx,hy,kx,ky,ax,ay]=seg,th=large?10:bone?4:6;
 const ops=[line(hx,hy,kx,ky,'I',th),line(kx,ky,ax,ay,'I',large?9:bone?4:6),line(hx,hy,kx,ky,bone?'q':'m',th-2),line(kx,ky,ax,ay,bone?'q':'m',large?6:bone?2:4),line(hx-1,hy,kx-1,ky,bone?'H':back?'m':'l',large?3:bone?1:2),line(kx-1,ky,ax-1,ay,bone?'Q':back?'s':'L',large?3:bone?1:2)];
 ops.push(grid(kx-3,ky-2,bone?['..qq..','.qHQq.','..qqI.']:KNEE));
 if(!bone){ops.push(line(kx-1,ky+3,ax-1,ay-2,back?'m':'L',2),line(ax-2,ay-1,ax+2,ay-1,'s',3),line(ax-2,ay-2,ax+1,ay-2,'H'));}
 if(bone)ops.push(grid(ax-3,ay,['.qqq....','qHQqqq..','qqqqqqqI','IIIIIIII']));
 else ops.push(grid(ax-4,ay,large?TOE[d]:BOOT_LEATHER[d]));
 return ops;
}
function legPose(d,state,i,leanX=0,leanY=0,bone=false){
 let legs=structuredClone(LEGS_IDLE[d]);
 if(state==='walk'){
  const source=WALK[d==='e'||d==='w'?'e':'s'][i%8];legs=structuredClone(source);
  if(d==='w')legs=legs.map(v=>v.map((p,j)=>j%2===0?96-p:p));
  if(d==='n')legs=legs.map((v,j)=>{v[5]=(i%4<2?j===0:j===1)?71:v[5];return v;});
 }
 if(state.startsWith('attack')){
  const active=i>=3&&i<=5;
  if(d==='e')legs=active?[[44,55,43,64,38,71],[53,55,61,64,66,71]]:[[43,54,42,63,39,71],[53,54,55,64,57,71]];
  if(d==='w')legs=active?[[43,55,35,64,30,71],[52,55,53,64,58,71]]:[[43,54,41,64,39,71],[53,54,54,63,57,71]];
  if(d==='s')legs=active?[[43,55,40,62,38,68],[54,55,58,64,60,71]]:[[43,54,41,64,39,71],[54,54,56,63,57,70]];
  if(d==='n')legs=active?[[43,55,40,64,38,71],[54,55,57,62,59,68]]:[[43,54,41,63,39,70],[54,54,56,64,57,71]];
 }
 if(state==='block')legs=[[43,55,39,65,37,71],[54,55,58,65,60,71]];
 for(const v of legs){v[0]+=leanX;v[1]+=leanY;}
 return {ops:legs.flatMap(v=>leg(v,d,{bone,back:d==='n'})),feet:legs.map(v=>({x:v[4],y:v[5]+(bone?3:4)}))};
}
function attackKey(d,state,i){
 const base=ATTACK[d][i];let k=[...base];if(state==='attack-backhand')k=[...BACK[d][i],...base.slice(8)];if(state==='attack-heavy')k=[...HEAVY[d][i],...base.slice(8)];
 return {shoulder:k.slice(0,2),elbow:k.slice(2,4),hand:k.slice(4,6),tip:k.slice(6,8),shield:k.slice(8,10),x:k[10],y:k[11],torso:k[12]};
}
function guard(d){return {
 s:{shoulder:[39,41],elbow:[35,47],hand:[33,51],tip:[33,27],shield:[61,52]},
 n:{shoulder:[58,41],elbow:[62,46],hand:[62,50],tip:[65,26],shield:[35,50]},
 e:{shoulder:[55,42],elbow:[58,47],hand:[60,51],tip:[65,28],shield:[46,48]},
 w:{shoulder:[41,42],elbow:[38,47],hand:[36,51],tip:[31,28],shield:[51,51]}
}[d];}
function swordSmear(d,variant,i){
 if(i!==3&&i!==4)return [];
 const paths={
  s:[[[35,15],[53,20],[69,32],[80,49],[83,66],[78,77]],[[82,53],[81,68],[72,80],[57,87],[41,85],[28,79]]],
  n:[[[68,14],[50,10],[34,14],[20,25],[14,39]],[[24,13],[16,23],[12,35],[19,46],[30,51]]],
  e:[[[61,12],[77,18],[87,29],[94,43],[94,56]],[[91,36],[94,52],[87,66],[76,77],[62,81]]],
  w:[[[35,12],[19,18],[9,29],[2,43],[2,56]],[[5,36],[2,52],[9,66],[20,77],[34,81]]]
 };
 let pts=paths[d][i-3];if(variant==='attack-backhand')pts=paths[d][4-i];
 if(variant==='attack-heavy'){
  const h=HEAVY[d][i];pts=[[h[6]-4,h[7]-19],[h[6],h[7]-10],[h[6]+2,h[7]], [h[6]-2,h[7]+2]];
 }
 return [...streak(pts,i===3?'L':'O',3),...streak(pts,i===3?'H':'A',1)];
}
function compactRoll(d,i){
 if(i===0||i===5){
  const yy=i===0?5:3;return {cloak:[grid(37,42,CLOAK[i%4])],body:[grid(42,26+yy,HEAD[d]),grid(38,38+yy,CHEST[d].slice(0,13)),...leg([43,56,37,66,38,71],d),...leg([54,56,59,66,61,71],d)],arms:[],equipment:[grid(54,52,SHIELD),...blade([35,54],[25,36]),gauntlet(35,54)],effects:[],feet:[{x:38,y:75},{x:61,y:75}]};
 }
 const keys=[
  ['............cccccccccc........','........cccrRRRRRrrrrcc.......','......ccrRRRRRRrrrrrrrccc.....','....ccrRRRRRRrrrrrrrrrcccc....','...crRRRRRRrrrrrrrrrrrccccI...','..crRRRRRrrrrrrrrrrrrrcccccI..','.crRRRRrrrrrccccccccrrccccccI.','crRRRRrrrccsssssssssccccccccI.','crRRRrrrcslLLLLLLmmmssccccccI.','crRRrrccslLHHHHHLLLmmsscccccI.','.crrccslLHHHHHLLLLLLmmsscccI.','..ccslLLLLIIIIIIIIImmmmmsccI..','..cslLLLmmLLImmmmmmmmmmssccI..','..slLLLmmmLLImmIImmmmmssccI...','..sLLLmmmmLLImmIImmmmssccI....','...sLLmmmmLLImmmmmmmssccI.....','....smmmmmLLImmmmssssscccI....','.....ssssssssssssslLLmssccI...','......sLLLmmmmmsslLHHmmssI....','.....slLLmmmmmmsslLLmmmsI.....','.....smmmmmmmmmssmmmmmmsI.....','......sssssssssssssssssI.....'],
  ['............ssssssss..........','.........ssslLLLLmmsss........','.......sslLHHHHLLLLmmmss......','......slLHHHHHHHLLLLmmmss.....','.....slLHHHHHHLLLLLLmmmsss....','....slLLLLLIIIIIIIIImmmmmss...','...slLLLLmmmLLImmmmmmmmmmsI...','...sLLLLmmmmLLImmIImmmmmmsI...','...sLLLmmmmmLLImmIImmmmmssI...','....sLLmmmmmLLImmmmmmmssccI...','.....smmmmmmLLImmmmssccccccI..','......ssssssssssssccrRRrrccI..','......sLLLmmmsscccrRRRRrrccI..','.....slLHHmmmssccrRRRRrrrccI..','.....sLLLLmmmsscrRRRRrrrrccI..','......smmmmmmsscrRRRrrrrrccI..','.......sssssscccrRRrrrrrcccI..','.......crrrcccccrRrrrrrrcccI..','........crrrrcccrrrrrrrccccI..','.........cccccccccccccccccI...','...........ccccccccccccccI....','..............ssssssssssI.....'],
  ['........cccccccccccc..........','......ccrRRRRRrrrrrccc.........','....ccrRRRRRRRrrrrrcccc........','...crRRRRRRrrrrrrrrccccI.......','..crRRRRRrrrrrrrrrrcccccI......','.crRRRRRrrrrrrrrrrrccccccI.....','crRRRRrrrrrrrrrrrrrccccccI.....','crRRRrrrrrrrrrrrrrcccccccI.....','.crRRrrrrcccccccccccccccI.....','..crrrccssssssssssscccccI.....','...ccsslLLLLLLLLmmmsscccI.....','...slLHHHHHLLLLLmmmmssccI.....','..slLHHHHHIIIIIIIImmmmssI.....','..sLLLLmmmmLLImmmmmmmmssI.....','...sLLLmmmmLLImmIImmmssI.....','....sLLmmmmLLImmmmmmssI......','.....sssssssssssssssssI......','......slLLmmmmmssLLmmsI......','.....slLLmmmmmmssLLmmsI......','.....smmmmmmmmmmssmmmsI......','......sssssssssssssssI.......'],
  ['..........ssssssss............','.......ssslLLLLmmsss..........','......slLHHHHLLLLmmmss........','.....slLHHHHHHLLLLmmmss.......','....slLLLLIIIIIIIImmmmss......','....sLLLmmmmLLImmmmmmmss......','.....sLLmmmmLLImmIImmmssI.....','......smmmmmLLImmmmmssI.......','.......sssssssssssssI........','.......crRRRRrrrrrrcc........','......crRRRRRrrrrrrccc........','.....crRRRRrrrrrrrrcccI.......','....crRRRRrrrrrrrrrccccI......','...crRRRrrrrrrrrrrrccccI......','..crRRrrrrrrrrrrrrrccccI......','.crRRrrrrrrccccrrrccccI......','.crrrrrrccccI.ccccccccI......','..ccccccI....slLLLLmssI......','...slLLLmss.slLLLLmmmsI......','..slLLLLmmssmmmmmmmmsI.......','..smmmmmmmssssssssssI........','...ssssssssIIIIIIIII.........']
 ];
 const r=keys[i-1],oy=76-r.length;
 return {cloak:[],body:[grid(32,oy,r)],arms:[],equipment:[],effects:[],feet:[{x:49,y:75}]};
}
function fallenKnight(d,i){
 if(i<3){
  const dy=[1,7,13][i];return {cloak:[grid(36,40+dy,CLOAK[i])],body:[grid(42,26+dy,HEAD[d]),grid(38,38+dy,CHEST[d].slice(0,14)),...leg([43,57,38,66,37,71],d),...leg([54,57,61,66,62,71],d)],arms:[...armorArm([39,42+dy],[33,48+dy],[33,55+dy])],equipment:[...blade([33,55+dy],[18,67]),gauntlet(33,55+dy),grid(58,56,SHIELD)],effects:[],feet:[{x:37,y:75},{x:62,y:75}]};
 }
 const fall=i===3?-3:i===4?-1:0;
 return {cloak:[grid(35,61+fall,['.....cccccccccccccccccccccccccccccc....','...ccrRRRRRRRrrrrrrrrrrrrrrrccccccccc...','..crRRRRRRRrrrrrrrrrrrrrrrrrrccccccccI..','.crRRRRRRrrrrrrrrrrrrrrrrrrrcccccccccI.','crRRRRRrrrrrrrrrrrrrrrrrrrrrrcccccccccI','.crRRRrrrrrrrrrrrrrrrrrrrccccccccccccI.','..cccccccccccccccccccccccccccccccccII..'])],body:[grid(20,60+fall,['.....sssssssss....','...sslLLLLLmmmss..','..slLHHHHLLLLmmss.','.slLHHHHIIIIIIImms','slLLLLmmmLLImmmmms','slLLLmmmmLLImmIIms','.sLLmmmmmLLImmmmms','..ssmmmmmLLImmssI.','....sssssssssssI..']),grid(35,64+fall,['...ssssssssssssss....','..slLLHHHHLLLmmmsss..','.slLHHHHLLLLLmmmmsss.','slLLLLLLLmmmmmmmmmsI','sLLLLLmmmmmmmmmmmssI','.smmmmmmmmmmmmmmssI.','..sssssssssssssssI..']),grid(54,67,['..ssssssssssssss.....','.slLLLmmLLLmmmmsss...','slLLLLmmLLmmmmmmmssI','sLmmmmssmmssmmmmmsI.','smmmmmI.smmmmmmmmsI.','IIIIIII.IIIIIIIIIII.'])],arms:[],equipment:[grid(39,59+fall,SHIELD),line(25,74,67,74,'I',3),line(27,73,66,73,'m'),line(27,74,66,74,'L'),line(28,70,28,76,'O'),grid(22,73,['ssss','slms','ssss'])],effects:[],feet:[{x:65,y:75}]};
}
function baseHeroPose(d,state,i){
 if(state==='roll')return compactRoll(d,i);
 if(state==='death')return fallenKnight(d,i);
 let k={...guard(d),x:0,y:0,torso:d};
 if(state.startsWith('attack'))k=attackKey(d,state,i);
 else if(state==='walk'){
  const bob=[0,1,0,-1,0,1,0,-1][i],sway=[-1,0,1,1,1,0,-1,-1][i];k.y=bob;k.elbow=[k.elbow[0]+sway,k.elbow[1]+bob];k.hand=[k.hand[0]+sway,k.hand[1]+bob];k.tip=[k.tip[0]+sway,k.tip[1]+bob];k.shield=[k.shield[0]-sway,k.shield[1]+bob];
 }else if(state==='idle'){k.y=[0,0,-1,0][i];}
 else if(state==='block'){k.y=1;k.shield=[k.shield[0]+(d==='w'?-4:d==='e'?4:d==='s'?-3:3),k.shield[1]-[4,6,5,4][i]];k.hand=[k.hand[0],k.hand[1]+1];}
 else if(state==='hurt'){k.x=[-2,-1,1,0][i]*(d==='w'?-1:1);k.y=[1,2,1,0][i];}
 k.shoulder=[k.shoulder[0],k.shoulder[1]-6];k.elbow=[k.elbow[0],k.elbow[1]-3];
 const legs=legPose(d,state,i,k.x,k.y),cloak=[grid(42+k.x,45+k.y,['...ccccccccc...','..crRRRrrrrcc..','.crRRRRrrrrccc.','crRRRRrrrrrcccI','crRRRrrrrrrcccI','.crRRrrrrrrccI.','..crRrrrrrrccI.','..crRrrrrrcccI.','..crRrrrrrcccI.','.crRRrrrrrcccI.','.crRrrrrrrcccI.','..crRrrrrrccI..','..crRrrrrrccI..','...crrrrrccI...','...crrrrrccI...','....crrrccI....','....crrrccI....','.....ccccI.....'])];
 const body=[...legs.ops,grid(38+k.x,32+k.y,CHEST[k.torso]),grid(43+k.x,20+k.y,HEAD[d])];
 const shieldShoulder=d==='s'?[58+k.x,36+k.y]:d==='n'?[39+k.x,36+k.y]:d==='e'?[44+k.x,35+k.y]:[53+k.x,37+k.y];
 const shieldElbow=[Math.round((shieldShoulder[0]+k.shield[0])/2),Math.round((shieldShoulder[1]+k.shield[1])/2)+2];
 const arms=[...armorArm(shieldShoulder,shieldElbow,k.shield,{far:d==='e'}),...armorArm(k.shoulder,k.elbow,k.hand,{far:d==='w'})];
 const sg=d==='n'?SHIELD_BACK:d==='e'||d==='w'?SHIELD_SIDE:SHIELD;
 const equipment=[gauntlet(...k.shield),grid(k.shield[0]-(d==='e'||d==='w'?3:6),k.shield[1]-5,sg),...blade(k.hand,k.tip),gauntlet(...k.hand)];
 return {cloak,body,arms,equipment,effects:state.startsWith('attack')?swordSmear(d,state,i):[],feet:legs.feet,hand:k.hand,tip:k.tip,headX:43+k.x,headY:20+k.y,torsoX:38+k.x,torsoY:32+k.y};
}
const HIGH_PLUME=[
 ['.....ccccc.......','...ccRERRcc......','..cRERRRrrcc.....','.cRERRrrrrrcc....','cRRRrrccccrrcc...','cRRrcc....crrcc..','crrcc......crrc..','cccc........crc..','............crc..','............crcc.','.............crc.','.............crc.','..............cc.'],
 ['......ccccc......','....ccRERRcc.....','...cRERRRrrcc....','..cRERRrrrrrcc...','.cRRRrrccccrrcc..','.cRRrcc....crrcc.','.crrcc......crrc.','.cccc........crc.','.............crc.','.............crc.','..............cc.'],
 ['.....cccccc......','...ccRERRRcc.....','..cRERRRRrrcc....','.cRERRrrrrrrcc...','cRRRrrrccccrrcc..','cRRrrcc....crrcc.','crrrcc......crrc.','ccccc........crc.','.............crc.','.............crcc','..............crc','..............ccc'],
 ['....cccccc.......','..ccRRERRcc......','.cRRERRRrrcc.....','cRRERRrrrrrcc....','cRRRrrccccrrcc...','cRRrcc....crrcc..','ccrcc......crrc..','.ccc........crc..','............crc..','.............cc..']
];
const FRONT_TABARD=['..OOOOO..','.OAyyyAO.','.OAyAAAO.','.OAAIAAO.','.OAIIIAO.','.OIIIIIO.','.OAIIIAO.','.OAIIIAO.','.OAAIAAO.','.OAAAAAO.','..OAAAO..','..OAAAO..','...OOO...'];
export function heroPose(d,state,i){
 const pose=baseHeroPose(d,state,i);
 if(state==='death'&&i>=3)pose.equipment=[pose.equipment[0],...blade([28,73],[68,73],{resting:true})];
 if(!['roll','death'].includes(state)){
  pose.plume=[grid(pose.headX-1,pose.headY-10,HIGH_PLUME[i%4]),grid(pose.headX+2,pose.headY-3,['.cc.','cRRc','cRrc','cccc'])];
  if(d!=='n')pose.body.push(grid(pose.torsoX+(d==='s'?6:d==='e'?7:5),pose.torsoY+19,FRONT_TABARD));
 }
 return pose;
}

export const SKELETON_HEAD={
 s:['....ssssss....','...sQHHHQss...','..sQHHHHHQqs..','.sQHHHHHHHQqs.','sQHHHHHHHHHQqs','sQIIQQHQIIQQqs','sQIIQQHQIIQQqs','.sQQQQIQQQQqsI','..sQQHIIHQQsI.','...QHQHQHQqI..','...sQQQQQss...','....sssssI....'],
 n:['....ssssss....','...sQHHHQss...','..sQHHHHHQqs..','.sQHHHHHHHQqs.','sQHHHHHHHHHQqs','sQHHHHQHHHHQqs','sQHHHQQHHHQQqs','.sQQHQQHHQQqsI','..sQQQQQQQQsI.','...sQQQQQQsI..','...sQQQQQss...','....sssssI....'],
 e:['...sssss......','..sQHHHQss....','.sQHHHHHQqs...','sQHHHHHHHQqs..','sQHHHHHHHHQqs.','sQHHQQQIIIQQqs','sQHQQQQIIIQQqs','.sQQQQQQIIQqsI','..sQQQQQHQqsI.','...sQQHQHQqI..','...sQQQQQss...','....sssssI....'],
 w:['......sssss...','....ssQHHHQs..','...sqQHHHHHQs.','..sqQHHHHHHHQs','.sqQHHHHHHHHQs','sqQQIIIQQQHHQs','sqQQIIIQQQQHQs','IsqQIIQQQQQQs.','.IsqQHQQQQQs..','..IqQHQHQQs...','...ssQQQQQs...','....Isssss....']
};
const RIBS={
 s:['....qqqqqqq....','..qqQHHQHQqqq..','.qQHHHHQHHHQqq.','qQHqqqqQqqqHQqs','sIQQHHHQHHHQQIs','.qQHHHHQHHHQqs.','..sIQQQQQQQIs..','..qQHHHQHHHQq..','...sIQQQQQIs...','....qHQHQq.....','....sQQQQs.....','...WOAAAAOo....','..qqQQQQQQqq...','.qQHHQQQQHHQq..','..qqQQQQQQqq...','...ssssssssI...'],
 n:['....qqqqqqq....','..qqQHHQHQqqq..','.qQHHHHQHHHQqq.','qQHqqqqQqqqHQqs','sIQQHHHQHHHQQIs','.qqpeeeeeepqqs.','..epppppeeees..','..epppppeepe...','..eppppeeepe...','..eppppeepee...','..eppppppeee...','.epppppppeeee..','.eppppeeepeee..','..eepppeeeee...','...eeeeeeee....','....eeeeee.....'],
 e:['....qqqqqq.....','...qQHHQQqq....','..qQHHHHQQqq...','.qQHqqQqqHQqs..','qQHHQQQHHQQqs..','sIQQHHQHHHQIs..','.qQHHHQHHHQqs..','..sIQQQQQQIs...','..qQHHQHHQq....','...sIQQQIs.....','....qHQq.......','...WOAAAOo.....','..qqQQQQQqq....','..qQHQQQHHQq...','...qqQQQQqq....','....ssssssI....'],
 w:['.....qqqqqq....','....qqQQHHQq...','...qqQQHHHHQq..','..sqQHqqQqqHQq.','..sqQQHHQQQHHQq','..sIQQHHHQHHQQI','..sqQHHHQHHHQq.','...sIQQQQQQIs..','....qQHHQHHQq..','.....sIQQQIs...','.......qHQq....','.....oOAAAWO...','....qqQQQQQqq..','...qQHHQQQHQq..','....qqQQQQqq...','....Issssss....']
};
function club(hand,tip){
 const [hx,hy]=hand,[tx,ty]=tip,norm=Math.max(1,Math.hypot(tx-hx,ty-hy)),ux=(tx-hx)/norm,uy=(ty-hy)/norm,px=-uy,py=ux;
 const pt=(back,side)=>[Math.round(tx-ux*back+px*side),Math.round(ty-uy*back+py*side)];
 const base=pt(14,0),head=[pt(0,0),pt(2,4),pt(10,4),pt(15,2),pt(15,-2),pt(10,-4),pt(2,-4)];
 const ops=[line(hx,hy,...base,'I',4),line(hx,hy,...base,'W',2),poly(head,'I','o'),poly([pt(1,-1),pt(3,-3),pt(11,-3),pt(13,-1)],'O'),line(...pt(4,1),...pt(11,1),'W'),line(...pt(3,0),...pt(7,0),'O'),line(...pt(14,-3),...pt(14,3),'s',3),line(...pt(14,-3),...pt(14,3),'l')];
 for(const back of [4,10])for(const side of [-1,1])ops.push(line(...pt(back,3*side),...pt(back-1,7*side),'I',3),line(...pt(back,3*side),...pt(back-1,7*side),'m'),line(...pt(back-1,6*side),...pt(back-1,7*side),'L'));
 return ops;
}
const RUST_HELM=['.......ss.......','......sOms......','.....soAOWs.....','....soAAooWs....','...sWoOooWWms...','..sWoOOooWWmms..','.sWoOOmOoWWmmsI.','sWoOmmOooWWWWssI','sWOOOOOOOOOWmmsI','.sWWmWWWWmmWsII.','..ssWWs.ssWWsI..'];
const BONE_RAG=['..cccccccccc..','.cprrrrrrrrcc.','cprrrRrrrrrrcc','cprrRRrrrrrrcc','cprrRRrrrrrccc','.cprRrrrrrrccI','.cprRrrrrrrccI','..cprrrrrrccI.','..cprrcrrcccI.','...cprc.cccI..','...cprc..ccI..','....ccI...I...','....cI........'];
RIBS.s=['....qqqqqqq....','..qQHHQHHHQqq..','.qQHQHQHQHQHQq.','qQHqqqqQqqqqHQq','sIQQQQHQHQQQQIs','.qQHnnHQHnnHQq.','..sIQQHQHQQIs..','..qQHnHQHnHQq..','...sIQHQHQIs...','....qHQHQq.....','....sQQQQs.....','...WOAAAAOo....','..qqQQQQQQqq...','.qQHHQQQQHHQq..','..qqQQQQQQqq...','...ssssssssI...'];
RIBS.e=['....qqqqqq.....','...qQHQHQqq....','..qQHHQHHQQq...','.qQHqqQqqHQqs..','qQHQHQQQHQQqs..','sIQHnHQHnHQIs..','.qQHnHQHnHQqs..','..sIQQHQHQQIs..','..qQHnHQHnQq...','...sIQQHQIs....','....qHQq.......','...WOAAAOo.....','..qqQQQQQqq....','..qQHQQQHHQq...','...qqQQQQqq....','....ssssssI....'];
RIBS.w=RIBS.e.map(r=>r.split('').reverse().join(''));
export function hollowPose(d,state,i){
 if(state==='death'){
  const dy=[0,4,10,14,18,20,20][i];
  if(i<3){const legs=legPose(d,'block',0,0,0,true);return {cloak:[],body:[...legs.ops,grid(41,29+dy,SKELETON_HEAD[d]),grid(41,41+dy,RIBS[d].slice(0,12))],arms:[...armorArm([40,45+dy],[34,53+dy],[32,59+dy],{bone:true})],equipment:[],effects:[],feet:legs.feet};}
  return {cloak:[],body:[grid(22,63,['...sssssssss....','..sQHHHHHQqss..','.sQHHHHHHHHQqs.','sQIIIQQHQIIIQqs','sQIIIQQHQIIIQqs','.sQQQQIIQQQQqs.','..sQQHQHQHQqsI.','...ssQQQQQssI..','.....sssssI....']),grid(40,67,['..qqqqqqqqqqq.....','.qQHQQHQHHHHQqq...','qQHHQQQHHQQQQHQq..','sIQQQQHHHHHQHQQIs.','.qqQQQQQQQQQQqqI..','..ssqqqqqqqqssI...']),line(57,71,72,73,'q',3),line(58,71,73,73,'H'),grid(68,72,['qqQQqqq','QQHHQQq','qqqqqqI','IIIIIII'])],arms:[],equipment:club([35,70],[65,67]),effects:[],feet:[{x:72,y:75}]};
 }
 let k={...guard(d),x:0,y:0,torso:d};if(state==='attack')k=attackKey(d,'attack',i);
 if(state==='walk'){k.y=[0,1,0,-1,0,1,0,-1][i];k.hand=[k.hand[0],k.hand[1]+k.y];k.tip=[k.tip[0],k.tip[1]+k.y];}
 if(state==='hurt'){k.x=[-3,-1,1,0][i];k.y=[1,2,1,0][i];}
 const legs=legPose(d,state,i,k.x,k.y,true);
 // Bone feet are drawn one row deeper than the armoured boot to share the same ground plane.
 const body=offsetOps(legs.ops,0,1);for(const f of legs.feet)f.y++;
 body.push(grid(41+k.x,42+k.y,RIBS[k.torso]),grid(41+k.x,30+k.y,SKELETON_HEAD[d]),line(47+k.x,40+k.y,48+k.x,45+k.y,'q',3),grid(40+k.x,22+k.y,RUST_HELM),grid(41+k.x,55+k.y,BONE_RAG),grid(44+k.x,41+k.y,['.crrrc.','crRRrrc','.crrrcc','..crc..']));
 const free=d==='s'?[62,55]:d==='n'?[34,54]:d==='e'?[43,53]:[54,55];
 const weaponShoulder=[(k.hand[0]<48?44:52)+k.x,45+k.y];
 const arms=[...armorArm(d==='s'?[54+k.x,45+k.y]:d==='n'?[44+k.x,45+k.y]:d==='e'?[44+k.x,45+k.y]:[52+k.x,45+k.y],[free[0],free[1]-4],free,{bone:true}),...armorArm(weaponShoulder,k.elbow,k.hand,{bone:true})];
 const effects=state==='attack'?swordSmear(d,'attack',i).map(o=>({...o,color:i===3?'#a77c4b':'#77573d'})):[];
 return {cloak:[],body,arms,equipment:[...club(k.hand,k.tip),gauntlet(...k.hand,true),gauntlet(...free,true)],effects,feet:legs.feet,hand:k.hand,tip:k.tip};
}

export function wardenPose(d,state,i){
 const active=state==='attack'&&i>=3&&i<=5;
 const key=state==='attack'?attackKey(d,'attack',i):{...guard(d),x:0,y:state==='walk'?[0,1,0,-1,0,1,0,-1][i]:0,torso:d};
 // Warden is drawn at a larger native size; its armour is not scaled hero pixels.
 const ox=16,oy=20,body=[],arms=[],equipment=[],cloak=[];let feet=[];
 const head=d==='n'?['.....OOOOOOOOOO.....','....OAyyyyAAAAOo....','...OAyyyyyyAAAAOo...','..OAyyyyyyyAAAAAOo..','.OAAAAOOOOOAAAAAOoI.','.OAAOsssssssOAAOoII.','..OIsssmmmsssIOoII..','...sLLLmmmLmmssI....','....sLmmmmmmmssI....','.....smmmmmmssI.....','......sssssssI......']:['.....OOOOOOOOOO.....','....OAyyyyAAAAOo....','...OAyyyyyyAAAAOo...','..OAyyyyyyyAAAAAOo..','.OAAAAOOOOOAAAAAOoI.','.OAAOIsssssIOAAOoII.','..OIsRssmssRsIOoII..','...sLmmmLmmmmsI.....','....sLmmLmmmssI.....','.....smmLmmssI......','......sssssssI......'];
 const torso=d==='n'?['.....sssssssssssss.....','..ssslLHHHHHHLLmmmsss..','.slLHHHHHHHHLLLmmmmsss.','slLHHHLLLLLLLLLmmmmsssI','slLLLLLrrrrrrrrrrrmmssI','.sLLLrRRRRRrrrrrrrmssI','..srrRRRRRrrrrrrrrssI.','...crRRRRRrrrrrrrrc...','...crRRRRrrrrrrrrrc...','...crRRRRrrrrrrrrrc...','..crRRRRRrrrrrrrrrcc..','..crRRRRrrrrrrrrrrcc..','..crRRRrrrrrrrrrrrcc..','...crRRrrrrrrrrrrcc...','...crRrrrrrrrrrrrcc...','....ccrrrccccrrrcc....','.....ccccI..ccccI.....']:['.....sssssssssssss.....','..ssslLHHHHHHLLmmmsss..','.slLHHHHHHHHLLLmmmmsss.','slLHHHLLLLLLLLLmmmmsssI','slLLLLLOAAAAAOmmmmmmssI','.sLLLLLOAyyAAOmmmmssI.','..sLLLLOAAAAAOmmmssI..','...sLLLOAAOOAOLmssI...','...sLLLLOAAOOLmmmss...','....sLLLmOOLLmmmssI...','....smmmLLLmmmmssI....','....OAAAAAAAAOOooI....','....OAyyAAAOOoooII....','...smmssmssmssmmssI...','..slLLmmrrrmmLLmmssI..','..smmmmrAAArrmmmmssI..','...ssmmrAAArrmmssI....'];
 if(state==='death'){
  if(i<3){const yy=[0,7,15][i];body.push(grid(54,39+yy,head),grid(52,50+yy,torso.slice(0,13)),...leg([59,77,51,86,49,91],d,{large:true}),...leg([71,77,80,86,82,91],d,{large:true}));feet=[{x:49,y:95},{x:82,y:95}];}
  else{body.push(grid(30,82,head),grid(47,86,torso.slice(0,8)),...leg([76,89,88,90,95,91],'e',{large:true}));cloak.push(grid(47,80,Array(12).fill('cccccrRRRRrrrrrrrrrrrrrrrcccccccccccc')));feet=[{x:95,y:95}];}
  equipment.push(line(42,96,107,96,'I',4),line(42,95,107,95,'O',2),poly([[99,87],[110,88],[116,94],[112,100],[103,100]],'L','m'));
  return {cloak,body,arms,equipment,effects:[],feet};
 }
 let legs=state==='walk'?WALK[d==='e'||d==='w'?'e':'s'][i]:LEGS_IDLE[d];legs=structuredClone(legs);
 if(state==='attack')legs=d==='e'?[[44,55,42,64,38,71],[53,55,61,64,66,71]]:d==='w'?[[43,55,35,64,30,71],[52,55,53,64,58,71]]:[[43,55,40,64,38,71],[54,55,57,64,60,71]];
 for(const l of legs){l[0]+=ox;l[1]+=oy+5;l[2]+=ox;l[3]+=oy;l[4]+=ox;l[5]+=oy;body.push(...leg(l,d,{large:true,back:d==='n'}));feet.push({x:l[4],y:l[5]+4});}
 const lean=state==='attack'?[0,-1,-1,1,2,2,1,0,0][i]:state==='hurt'?[-3,-1,1,0][i]:0,bob=state==='hurt'?[2,1,0,0][i]:key.y;
 cloak.push(grid(52+lean,54+bob,['......cccccccccccccc......','....ccrRRRRRRRrrrrccc.....','...crRRRRRRRrrrrrrrccc....','..crRRRRRRRrrrrrrrrcccc...','.crRRRRRRRrrrrrrrrrcccccI.','crRRRRRRrrrrrrrrrrrccccccI','crRRRRRrrrrrrrrrrrrccccccI','.crRRRRrrrrrrrrrrrrcccccI.','..crRRRrrrrrrrrrrrrcccccI.','..crRRRrrrrrrrrrrrrcccccI.','.crRRRRrrrrrrrrrrrccccccI.','crRRRRrrrrrrrrrrrrccccccI.','crRRRrrrrrrrrrrrrrccccccI.','.crRRrrrrrrrrrrrrrcccccI..','..crRrrrrrrrrrrrrrccccI...','...ccrrrrcccrrrrcccccI...','....ccccccI.ccccccccI....']));
 body.push(grid(52+lean,51+bob,torso),grid(54+lean,39+bob,head),grid(54+lean,30+bob,['.O......O......O.','OAO....OAO....OAO','.OAO..OAAAO..OAO.','..OAAOAAAAAOAAO..','...OAAAAAAAAAO...','....OAyyyyAAO....','.....OOOOOOO.....']),rect(61+lean,67+bob,8,8,'s'),grid(58+lean,69+bob,['..smmssmssmss..','.slmmsmssmssms.','slLmmrAAArrmmss','sLmmmrAAArrmmms','.smmmrAAArrmmss','..ssmrAAArrmssI']));
 // Both fists sit on the same keyed haft. The lower hand leads its weight through the swing.
 const weaponKeys={
  s:[[83,56,83,68,84,22,82,94],[77,44,82,55,65,15,94,85],[73,41,80,50,52,13,103,81],[68,56,77,61,32,34,107,79],[63,63,75,65,27,58,111,71],[67,68,77,73,42,47,101,94],[75,67,81,73,62,45,96,95],[82,60,83,71,81,28,85,96],[83,56,83,68,84,22,82,94]],
  e:[[83,56,83,68,84,22,82,94],[73,44,80,53,54,17,103,84],[73,40,82,47,43,17,116,74],[83,54,95,54,39,54,123,54],[84,62,96,64,43,55,124,69],[83,68,92,74,49,45,118,92],[81,66,87,76,67,35,100,100],[83,58,83,71,82,25,84,97],[83,56,83,68,84,22,82,94]],
  n:[[79,55,80,67,77,20,83,94],[78,42,83,54,67,14,98,88],[70,39,79,48,48,12,108,82],[63,40,73,46,26,20,113,70],[56,43,68,48,20,29,113,65],[59,51,71,58,25,30,111,83],[69,57,78,67,47,32,103,96],[78,56,80,69,74,25,85,97],[79,55,80,67,77,20,83,94]],
  w:[[47,56,47,68,46,22,48,94],[57,44,50,53,76,17,27,84],[57,40,48,47,87,17,14,74],[47,54,35,54,91,54,5,54],[46,62,34,64,87,55,4,69],[47,68,38,74,81,45,12,92],[49,66,43,76,63,35,30,100],[47,58,47,71,48,25,46,97],[47,56,47,68,46,22,48,94]]
 };
 const wk=weaponKeys[d][state==='attack'?i:0],h1=wk.slice(0,2),h2=wk.slice(2,4),end=wk.slice(4,6),butt=wk.slice(6,8);
 equipment.push(line(...end,...butt,'I',5),line(...end,...butt,'o',3),line(end[0]-1,end[1],butt[0]-1,butt[1],'O'));
 const sign=d==='w'?-1:1;
 equipment.push(poly([[end[0]-sign*3,end[1]-9],[end[0]+sign*8,end[1]-9],[end[0]+sign*17,end[1]-3],[end[0]+sign*15,end[1]+8],[end[0]+sign*9,end[1]+13],[end[0]+sign*8,end[1]+3],[end[0],end[1]+2]],'I','m'),poly([[end[0]+sign*8,end[1]-8],[end[0]+sign*16,end[1]-3],[end[0]+sign*14,end[1]+7],[end[0]+sign*9,end[1]+11]],'L'),line(end[0],end[1]-9,end[0],end[1]-13,'H',2));
 const shoulder1=[54+lean,54+bob],shoulder2=[77+lean,54+bob];
 arms.push(...armorArm(shoulder1,[h1[0]-8,h1[1]+3],h1,{large:true}),...armorArm(shoulder2,[h2[0]+(d==='w'?-5:5),h2[1]-8],h2,{large:true}));equipment.push(gauntlet(...h1),gauntlet(...h2));
 const effects=active?swordSmear(d,'attack',i===3?3:4).map(o=>offsetOps([o],16,20)[0]):[];
 return {cloak,body,arms,equipment,effects,feet,hand:h1,tip:end,secondHand:h2,haft:{from:end,to:butt}};
}

const GHOST_FACE=['........jj........','.......jJJj.......','......jJkkJj......','.....jJkJJJJj.....','....jJkJjjJJJj....','...jJkJjIIjJJJj...','..jJkJjIIIIjJJJj..','.jJkJjIIIIIIjJJJj.','jJkJjIIIIIIIIjJJJj','jJJjIIkKIIKkIIjJJj','jJJjIIIjIIjIIIjJJj','jJJJjIIIjjIIIjJJJj','.jJJJjIIIIIIjJJJj.','..jJJJjIIjjjJJJj..','...jJJJJjjJJJJj...','....jjJJJJJJjj....','......jjJJjj......'];
const TAIL=[['...jjJJJJJJjj...','..jJkkKKkkkkJj..','.jJkkKKKkkkkJJj.','jJkkKKkkkkkkJJjI','jJkkkkkkkkkkJJjI','.jJkkkkkkkkJJjI.','..jJkkkkkkJJjI..','...jJkkkkJJjI...','....jJkkJJjI....','...jJkkJJjI.....','..jJkkJJjI......','...jjJJjI.......','.....jjI........'],['...jjJJJJJJjj...','..jJkkKKkkkkJj..','.jJkkKKKkkkkJJj.','jJkkKKkkkkkkJJjI','jJkkkkkkkkkkJJjI','.jJkkkkkkkkJJjI.','..jJkkkkkkJJjI..','...jJkkkkJJjI...','....jJkkJJjI....','.....jJkkJJjI...','......jJkkJJjI..','.......jjJJjI...','.........jjI....'],['...jjJJJJJJjj...','..jJkkKKkkkkJj..','.jJkkKKKkkkkJJj.','jJkkKKkkkkkkJJjI','jJkkkkkkkkkkJJjI','.jJkkkkkkkkJJjI.','..jJkkkkkkJJjI..','...jJkkkkJJjI...','....jJkkJJjI....','.....jJJjI......','....jJJjI.......','...jJJjI........','....jjI.........'],['...jjJJJJJJjj...','..jJkkKKkkkkJj..','.jJkkKKKkkkkJJj.','jJkkKKkkkkkkJJjI','jJkkkkkkkkkkJJjI','.jJkkkkkkkkJJjI.','..jJkkkkkkJJjI..','...jJkkkkJJjI...','....jJkkJJjI....','...jJkkJJjI.....','....jJJjI.......','.....jJjI.......','......jI........']];
export function wispPose(state,i){
 const bob=[0,-1,0,1][i%4],body=[],arms=[],equipment=[],effects=[];
 if(state==='death'){
  if(i<3){body.push(grid(24,28+bob,TAIL[i%4]),grid(23,13+bob,GHOST_FACE));}
  else if(i<5)body.push(grid(25,29,['..jjJJjj..','.jJkkkJJj.','jJkKKKkkJj','jJkKYYkkJj','.jJkkkJJj.','..jjJJjjI.','....jjI...']));
  for(const [x,y]of [[16,22],[42,28],[23,47],[39,45],[31,14]])effects.push(grid(x+(i%2),y+(i>4?i-4:0),i<5?['.J.','JkJ','.J.']:['JJ']));
  return {cloak:[],body,arms,equipment,effects,feet:[],airborne:true};
 }
 body.push(grid(24,28+bob,TAIL[i%4]),grid(23,13+bob,GHOST_FACE),grid(26,30+bob,['..jjJJJJjj..','.jjJkJJkJjj.','jJJkJKkJkJJj','jJJJKYYKJJJj','.jJJJKkJJJj.','..jJJkJJJj..','...jjJJjj...']));
 const cast=state==='attack',hands=cast?[[19,31],[16,26],[17,22],[23,22],[40,24],[43,30],[39,34],[20,36],[18,36]][i]:[18,36+bob];
 const other=cast?[[45,31],[48,26],[47,22],[41,22],[40,24],[43,30],[39,34],[44,36],[46,36]][i]:[46,36+bob];
 arms.push(line(25,29+bob,21,32,'j',5),line(21,32,...hands,'j',4),line(25,28+bob,21,31,'J',3),line(21,31,...hands,'k',2),line(39,29+bob,43,32,'j',5),line(43,32,...other,'j',4),line(39,28+bob,43,31,'J',3),line(43,31,...other,'k',2));
 equipment.push(grid(hands[0]-2,hands[1]-2,['.JJJ.','JkkkJ','JkKkJ','.JJJ.']),grid(other[0]-2,other[1]-2,['.JJJ.','JkkkJ','JkKkJ','.JJJ.']));
 if(cast&&i<5)effects.push(grid(27,15-i,['....A....','...AyA...','..AyyyA..','.AyyYyyA.','..AyyyA..','...AyA...','....A....']));
 if(cast&&(i===3||i===4))effects.push(...streak([[32,9],[45,17],[48,30],[42,41],[29,44],[18,36],[15,23],[22,13],[32,9]],i===3?'k':'J',2));
 if(state==='hurt'){
  const recoil=[-3,-1,1,0][i];return {cloak:[],body:offsetOps(body,recoil,0),arms:offsetOps(arms,recoil,0),equipment:offsetOps(equipment,recoil,0),effects,feet:[],airborne:true};
 }
 return {cloak:[],body,arms,equipment,effects,feet:[],airborne:true};
}
