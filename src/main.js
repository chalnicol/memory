
window.onload = function () {

    FBInstant.initializeAsync().then(function() {

        let windowHeight = window.innerHeight;

        
        let _gH = windowHeight > 1280 ? 1280 : windowHeight,
            _gW = 9/16 * _gH;

        document.getElementById('game_div').style.height = _gH;
        document.getElementById('game_div').style.width = _gW;
       
        console.log ( windowHeight, _gH, _gW )

        let _scale = _gW/720;

        let _bestScores = { moves: [], time : [] };

        class Preloader extends Phaser.Scene {

            constructor ()
            {
                super('Preloader');
            }
        
            preload ()
            {
                
                this.facebook.once('startgame', this.startGame, this);

                this.facebook.showLoadProgress(this);

                this.load.audioSprite('sfx', 'assets/sfx/fx_mixdown.json', [
                    'assets/sfx/sfx.ogg',
                    'assets/sfx/sfx.mp3'
                ]);
                
                this.load.audio ('bgsound', ['assets/sfx/bgsound.ogg', 'assets/sfx/bgsound.mp3'] );

                this.load.audio ('bgsound2', ['assets/sfx/bgsound2.ogg', 'assets/sfx/bgsound2.mp3'] );
                
                this.load.audio('clocktick', ['assets/sfx/tick.ogg', 'assets/sfx/tick.mp3']);


                this.load.spritesheet('thumbs', 'assets/images/spritesheet.png', { frameWidth: 75, frameHeight: 75 });

                this.load.spritesheet('tiles', 'assets/images/tiles.png', { frameWidth: 158, frameHeight: 158 });

                this.load.spritesheet('best_btn', 'assets/images/best_btn.png', { frameWidth: 638, frameHeight: 85 });

                this.load.spritesheet ('skip_btn', 'assets/images/skip_btn.png', { frameWidth: 50, frameHeight: 50 });

                this.load.spritesheet ('click', 'assets/images/click.png', { frameWidth: 550, frameHeight: 65 });

                this.load.spritesheet ('prompt_btns', 'assets/images/prompt_btns.png', { frameWidth: 326, frameHeight: 80 });

                this.load.spritesheet ('endlogo', 'assets/images/endlogo.png', { frameWidth: 65, frameHeight: 65 });

                this.load.image ('bg', 'assets/images/bg.png');

                this.load.image ('bg1', 'assets/images/bg1.png');

                this.load.image ('title', 'assets/images/title.png');

                this.load.image ('table', 'assets/images/table.png');

                this.load.image ('panel', 'assets/images/panel.png');

                this.load.image ('prompt', 'assets/images/prompt.png');

                //this.load.image ('best_scores', 'assets/images/best_scores.png');

                this.add.text ( _gW/2, _gH/2, '', { fontSize: 20*_scale, fontFamily:'Oswald', color:'#fff'}).setOrigin(0.5);

                this.add.text ( _gW/2, _gH/2, '', { fontSize: 10*_scale, fontFamily:'Coda', color:'#fff'}).setOrigin(0.5);


            }        
            startGame ()
            {
                this.scene.start('HomeScreen');
            }
        
        }

        class HomeScreen extends Phaser.Scene {

            constructor ()
            {
                super('HomeScreen');
            }
            preload () {

                this.load.image ('dude', this.facebook.playerPhotoURL );
            }
            create () 
            {
                
                this.lvlCount = 3;

                for ( let i=0; i<this.lvlCount; i++) {
                    _bestScores.moves.push (0);
                    _bestScores.time.push (0);
                }

                this.initHomeSound ();

                this.initHomeInterface ();

                this.initTable ();
                
                //this.initData ();

                this.initScores ();

            }
            initHomeSound () {

                this.bgmusic = this.sound.add('bgsound').setVolume(0.1).setLoop(true);
                this.bgmusic.play();
                this.music = this.sound.addAudioSprite('sfx');

            }
            initHomeInterface () {


                //set graphics..

                let bg = this.add.image (_gW/2, _gH/2, 'bg').setScale (_gW/720);

                let title = this.add.image (_gW/2, _gH/2, 'title').setScale (_gW/720);


                //set player details..

                let ry = _gH * 0.48, rz = 120 * _scale;

                this.add.rectangle ( _gW/2, ry, rz, rz, 0xdedede, 1 ).setStrokeStyle ( 3, 0xf5f5f5 );

                this.add.text (_gW/2, ry + (90*_scale), 'Welcome, ' + this.facebook.playerName + '!', { fontFamily:'Oswald', fontSize: 25*_scale, color : '#fff' }).setOrigin (0.5);

                this.add.image ( _gW/2, ry, 'dude').setDisplaySize( rz, rz);


                //click..

                let clickCon = this.add.container ( -_gW/2, 353 * _scale ).setSize( 544* _scale, 63 * _scale);
            
                let clickimg = this.add.image (0, 0, 'click').setScale (_gW/720);

                clickCon.add ( clickimg );


                clickCon.on ('pointerover', function () {
                    this.getAt (0).setFrame ( 1 );
                });
                clickCon.on ('pointerup', function () {
                    this.getAt (0).setFrame ( 0 );
                });
                clickCon.on ('pointerout', function () {
                    this.getAt (0).setFrame ( 0 );
                });
                clickCon.once ('pointerdown', function () {
                    
                    this.scene.music.play('clicka');

                    this.scene.initGame ();
            
                });


                let delayEntry = 900;

                this.tweens.add ({
                    targets: clickCon,
                    x : _gW/2,
                    duration : 300,
                    ease : 'Power2',
                    delay : delayEntry,
                    onComplete : function () {
                        this.targets [0].setInteractive ();
                    }
                })

               this.time.delayedCall ( delayEntry, function () {
                    this.music.play ('move');
                },[], this  );

                
               


            }
            initTable () {

                //set table..
                this.tableContainer = this.add.container ( 0, 550 * _scale );

                let table = this.add.image (_gW/2, 932*_scale, 'table').setScale (_scale);

                this.tableContainer.add ( table );

                this.stats = {
                    time : [],
                    moves : []
                }
          
                let itemW = 568 * _scale,
                    itemH = 78 * _scale,
                    itemX = 76 * _scale,
                    itemY = 876 * _scale;

                let txtConfiga = { color : '#333', fontSize : itemH * 0.5, fontFamily : 'Oswald'  };

                for ( let i = 0; i < this.lvlCount ; i++ ) {

                    let miniCont = this.add.container ( itemX, itemY + i * ( itemH ) ).setName ('item' + i );

                    let bgRect = this.add.rectangle ( 0, 0, itemW, itemH).setOrigin (0); //setStrokeStyle(1, 0x0a0a0a);

                    let lvl = this.add.text ( itemW * 0.11, itemH/2, (i+1) < 10 ? '0' + (i+1) : i+1, txtConfiga  ).setOrigin (0.5);

                    let timetxt = this.add.text ( itemW/2, itemH/2, '000:00:00', txtConfiga ).setOrigin (0.5);

                    let movestxt = this.add.text ( itemW * 0.88, itemH/2, '9999', txtConfiga ).setOrigin (0.5);

                    miniCont.add ([bgRect, lvl, timetxt, movestxt]);

                    this.stats.time.push ( timetxt );

                    this.stats.moves.push ( movestxt );
                    
                    this.tableContainer.add (miniCont);
                }


            }
            initData () {
                 
                var initData = {
                    bestScores : _bestScores.moves.toString(),
                    bestTime : _bestScores.time.toString(),
                }
                this.facebook.saveData ( initData );
                
                //this.facebook.data.set('bestScores', _bestScores.moves.toString() );

                this.facebook.on('savedata', function (data) {

                    console.log ('save data successful : gamescreen', data );
                
                });
                
                this.facebook.on('savedatafail', function (error) {
                
                    console.log ('error saving data : gamescreen');
                });   

            }
            initScores () {

               
               
                

                this.facebook.getData(['bestScores', 'bestTime']);

                this.facebook.once('getdata', function (data) {

                    console.log ( data );
                   
                    this.updateStats (data);

                    this.tweens.add ({
                        targets : this.tableContainer,
                        y : 0,
                        duration : 300,
                        ease : 'Power2',
                        delay : 300
                    });

                    this.time.delayedCall (100, function () {
                        this.music.play ('move');
                    }, [], this );


                }, this);

                this.facebook.once ('getdatafail', function ( error ) {

                    console.log ('error saving data : homescreen');

                });

            }
            updateStats ( data ) {

                if ( data.hasOwnProperty ('bestTime') ) {

                    let timeArr = data.bestTime.split(',');
                    
                    for ( var i=0; i<timeArr.length; i++) {
        
                        this.stats.time [i].setText ( this.convertToTime( timeArr[i] ) );
                    }

                    _bestScores.time = timeArr;
                }


                if ( data.hasOwnProperty ('bestScores') ) {

                    let movesArr = data.bestScores.split(',');

                    for ( var i=0; i< movesArr.length; i++) {
        
                        let num = parseInt ( movesArr[i] );
    
                        this.stats.moves [i].setText ( num < 10 ? '0' + num : num );
                    }

                    _bestScores.moves = movesArr;
            
                }

               
               

            }
            convertToTime ( sec ) {

                let min = Math.floor ( sec/60);

                let hrs = Math.floor (min/60);

                let str_sec = (sec%60) < 10 ? '0' + (sec%60) : (sec%60);

                let str_min = (min%60) < 10 ? '0' + (min%60) : (min%60);

                let str_hrs = hrs < 10 ? '0' + hrs : hrs;
                
                return str_hrs + ":" + str_min +":" + str_sec;

            }
            initGame () {
                
                this.bgmusic.stop();
                
                this.time.delayedCall (500, function () {
                    this.scene.start ('GameScreen');
                }, [], this);
                
            }

        }

        class GameScreen extends Phaser.Scene {

            constructor ()
            {
                super('GameScreen');
            }
            create ()
            {
                
                this.openTiles = [];

                this.halt = false;
                
                this.gmLvl = 1;

                this.gmData = [{ r : 5, c : 4 }, { r : 6, c : 5 }, { r : 7, c : 6 } ];

                this.facebook.on('savedata', function (data) {

                    console.log ('save data successful : gamescreen', data );
                
                });
                
                this.facebook.on('savedatafail', function (error) {
                
                    console.log ('error saving data : gamescreen');
                });

                this.initSound ();

                this.initGameInterface ();

                this.initGame ();

            }
            initSound () {

                this.music = this.sound.addAudioSprite('sfx');

                this.tick = this.sound.add ('clocktick').setVolume(0.2);

                this.bgmusic = this.sound.add('bgsound2').setVolume(0.1).setLoop(true);
                this.bgmusic.play();

            }
            initGameInterface () {

                let bg = this.add.image (_gW/2, _gH/2, 'bg1').setScale (_gW/720);

                let panel = this.add.image (_gW/2, _gH/2, 'panel').setScale (_gW/720);


                //..
                this.controlBtns = [];

                let btns = ['Home', 'Back', 'Skip'];

                let skpW = 130 * _scale,
                    skpH = 50 * _scale,
                    skpS = skpW * 0.05,
                    skpX = (35 * _scale) + skpW/2;

                for ( let i = 0; i < btns.length; i++ ) {

                    let xp = skpX + i * (skpW+skpS),
                        yp = (70 * _scale);

                    let miCont = this.add.container ( xp, yp ).setSize ( skpW, skpH ).setData('id', i ).setInteractive();

                    let rect_sm = this.add.rectangle ( 0, 0, skpW, skpH ); //setFillStyle ( 0x0a0a0a, 0.5);

                    let skip = this.add.image (-skpW *0.45, 0, 'skip_btn' , i ).setScale (_scale).setOrigin (0, 0.5);

                    let txt = this.add.text ( -skpW *0.05, 0, btns [i], { fontFamily:'Oswald', fontSize: 28*_scale, color : '#fff'}).setOrigin ( 0, 0.5 );

                    
                    miCont.add ([rect_sm, skip, txt]);

                    miCont.on('pointerover', function () {
                        this.getAt(1).setTint ( 0xffff66 );
                        this.getAt(2).setTint ( 0xffff66 );
                    });
                    miCont.on('pointerout', function () {
                        this.getAt(1).clearTint();
                        this.getAt(2).clearTint();
                    });
                    miCont.on('pointerup', function () {
                        this.getAt(1).clearTint();
                        this.getAt(2).clearTint();
                    });
                    miCont.on('pointerdown', function () {

                        this.scene.controlsClick ( this.getData ('id') );
                        
                    });

                    this.controlBtns.push ( miCont );
                }



                //...
                let configlvlTxt = {
                    color : '#fff',
                    fontFamily : 'Oswald',
                    fontSize : 35 * _scale
                }

                let txty = 150 * _scale;
                
                this.lvlText = this.add.text ( _gW * 0.1, txty , 'Level : 1', configlvlTxt ).setOrigin (0,0.5);
                
                this.lvlText.setShadow  ( 0, 2, '#000', 3, false, true );

                this.movText = this.add.text ( _gW * 0.3, txty, 'Moves : 0', configlvlTxt ).setOrigin (0,0.5);

                this.movText.setShadow  ( 0, 2, '#000', 3, false, true );

                this.timerText = this.add.text ( _gW * 0.57, txty, 'Timer : 00:00:00', configlvlTxt ).setOrigin ( 0, 0.5);
                
                this.timerText.setShadow  ( 0, 2, '#000', 3, false, true );
            

                //..
                let best_btn = this.add.image (_gW/2, _gH * 0.9, 'best_btn').setScale (_gW/720).setInteractive();

                best_btn.on('pointerover', function () {
                    this.setFrame (1);
                });
                best_btn.on('pointerout', function () {
                    this.setFrame (0);
                });
                best_btn.on('pointerdown', function () {
                    //..
                    this.playSound ('clicka');

                    if ( this.isInitPrompted ) this.startLevelContainer.setVisible ( false );

                    this.showBestScores();

                }, this);

            }
            initGame () {

                this.openTiles = [];
                
                let r = this.gmData[this.gmLvl - 1].r,
                    c = this.gmData[this.gmLvl - 1].c;

                this.scoreTotal = r * c / 2;

                this.isInitPrompted = false;

                this.score = 0;

                this.moves = 0;

                this.totalSeconds = 0;

                this.lvlText.text = 'Level : ' + this.gmLvl;
                this.movText.text = 'Moves : 0';
                this.timerText.text = 'Timer : 00:00:00';

                this.createTiles ( r, c );

                this.showInitPrompt ();

                this.controlBtns[1].disableInteractive().setAlpha(0.3);
                this.controlBtns[2].disableInteractive().setAlpha(0.3);

                this.time.delayedCall ( 700, function () {
                    if ( this.gmLvl > 1 ) this.controlBtns[1].setInteractive().setAlpha(1);
                    if ( this.gmLvl < 3 ) this.controlBtns[2].setInteractive().setAlpha(1);
                }, [], this);

                this.gameTimer = this.time.addEvent ({ delay:1000, loop:true, callback: this.showTimer, callbackScope:this, paused:true });
                


            }
            showTimer () {

                this.totalSeconds += 1;

                this.tick.play();

                this.timerText.setText ( 'Timer : ' + this.convertToTime ( this.totalSeconds) );

            }
            createTiles ( row, col ) {

                this.grid = [];

                this.tiles = [];

                this.tilesContainer = this.add.container ( 0, 0 );

                let totlW = _gW * 0.88,
                    tempW = totlW/col,
                    tileW = tempW * 0.98,
                    tileS = tempW - tileW,
                    sX = ( _gW - totlW )/2 + tileW/2,
                    sY =  ( _gH - (tempW*row) - tileS )/2 + tileW/2;

                let counter = 0;

                //generate frames..
                let frames = this.generateFrames ( row*col, 22 );

                for ( let i = 0 ; i < row; i++ ) {

                    for ( let j = 0 ; j < col; j++ ) {

                        let xp = sX + j * (tileW + tileS),
                            yp = sY + i * (tileW + tileS);

                        this.grid.push ({'x':xp, 'y':yp });

                    
                        let tileR = new TileRaw ( this, 'tile'+ counter, _gW/2, _gH/2, tileW, tileW, frames [counter], counter, counter+1 );

                        tileR.on('pointerover', function () {
                            this.getAt (0).setFrame (1);
                        });
                        tileR.on('pointerout', function () {
                            this.getAt (0).setFrame (0);
                        });
                        tileR.on('pointerdown', function () {

                            if ( this.scene.halt ) return;

                            this.flip ();
                            
                            this.removeInteractive();

                            this.scene.playSound ('pick');

                            this.scene.tileClick ( this.id );

                        });

                        this.tilesContainer.add ( tileR );

                        this.tweens.add ({
                            targets : tileR,
                            x : xp, y : yp,
                            duration : 500,
                            easeParams : [1.5, 1],
                            ease : 'Elastic',
                            onComplete : function () {
                                this.targets [0].setInteractive();
                            }
                        });

                        counter++;

                    }
                }

                this.playSound ('move');

            }
            startLevel () {
                this.removeInitPrompt ();
                this.gameTimer.paused = false;
            }
            removeTiles () {
                this.tilesContainer.destroy ();
            }
            tileClick ( tileid ) {
                
                this.openTiles.push ( tileid );

                this.moves += 1;
                this.movText.text = 'Moves : ' + this.moves;

                if ( this.openTiles.length >= 2 ) { 

                    this.halt = true;
                    this.analyzeData ();
                }

            }
            analyzeData () {

                let tile1 = this.tilesContainer.getByName ( this.openTiles[0] ),
                    tile2 = this.tilesContainer.getByName ( this.openTiles[1] );

                if ( tile1.cnt == tile2.cnt) {
                    
                    tile1.isRevealed = true;
                    tile2.isRevealed = true;
                    
                    this.tweens.add ({
                        targets : [ tile1, tile2 ],
                        scaleX : 1.1,
                        scaleY : 1.1,
                        duration : 100,
                        yoyo : true,
                        ease : 'Cubic.easeIn'
                    });

                    this.halt = false;

                    this.openTiles = [];

                    this.score += 1;

                    if ( this.score == this.scoreTotal) {

                        let datatopass = this.analyzeScore ();

                        this.showPrompt( datatopass );

                        this.gameTimer.destroy();

                    }else {

                        this.time.delayedCall ( 300, this.playSound, [ 'bleep', 0.4 ], this );
                        
                    }

                }else {

                    this.time.delayedCall ( 300, function () {

                        this.shakeUpGrid ();

                        this.playSound ('move', 0.4 )

                    }, [], this)
                    
                    this.time.delayedCall ( 1000, function () {

                        for ( let i = 0; i < this.openTiles.length; i++ ) {
                            
                            let tileR =  this.tilesContainer.getByName ( this.openTiles[i] );

                            tileR.flip (false).setInteractive();
                            
                        }               

                        this.halt = false;

                        this.openTiles = [];

                    }, [], this)
                    
                }
            }
            shakeUpGrid () {

                let drt = 200;
                
                if ( this.gmLvl == 1 ) {

                    let tile1 = this.tilesContainer.getByName (this.openTiles[0]),
                        tile2 =  this.tilesContainer.getByName (this.openTiles[1]);

                    let grid1 = tile1.gp,
                        grid2 = tile2.gp;
                    
                    this.tilesContainer.bringToTop ( tile1 );
                    this.tilesContainer.bringToTop ( tile2 );
                    

                    this.tweens.add ({
                        targets : tile1,
                        x : this.grid [grid2].x,
                        y : this.grid [grid2].y,
                        duration : drt,
                        ease : 'Power3' 
                    });
                    this.tweens.add ({
                        targets : tile2,
                        x : this.grid [grid1].x,
                        y : this.grid [grid1].y,
                        duration : drt,
                        ease : 'Power3' 
                    });

                    tile1.gp = grid2;
                    tile2.gp = grid1;
                    
                    
                }
                else if ( this.gmLvl == 2)  {

                    //get tiles and push to temp arr..
                    var tempArr = [];
                    this.tilesContainer.iterate ( function ( tile ) {
                        if ( !tile.isRevealed && !tile.getData('isOpen') ) {
                            tempArr.push ( tile.id );
                        }
                    });

                    var finArr = [];
                    while ( finArr.length < 2 ) {

                        let randomIndex = Math.floor ( Math.random() * tempArr.length );

                        tempArr.splice ( randomIndex, 1 );

                        finArr.push ( tempArr [ randomIndex ] );

                    }

                    //and set..
                    for ( let i in this.openTiles ) {

                        let tilea = this.tilesContainer.getByName ( this.openTiles [i] ),

                            tileb = this.tilesContainer.getByName ( finArr [i] );

                        let gridPosa = tilea.gp,  gridPosb = tileb.gp;

                        this.tilesContainer.bringToTop ( tilea );
                        this.tilesContainer.bringToTop ( tileb );

                        this.tweens.add ({
                            targets : tilea,
                            x : this.grid [gridPosb].x,
                            y : this.grid [gridPosb].y,
                            duration : 500,
                            ease : 'Power3' 
                        });
                        this.tweens.add ({
                            targets : tileb,
                            x : this.grid [gridPosa].x,
                            y : this.grid [gridPosa].y,
                            duration : 500,
                            ease : 'Power3' 
                        });

                        tilea.gp = gridPosb;
                        tileb.gp = gridPosa;
                        
                    }

                }
                else {

                    let tempArr = [];

                    this.tilesContainer.iterate ( function ( tile ) {
                        tempArr.push ( tile.gp );
                    });

                    //randomize..
                    let gridArr = [];

                    while ( tempArr.length > 0 ) {

                        let randomIndex = Math.floor ( Math.random() * tempArr.length );

                        gridArr.push ( tempArr[randomIndex] );

                        tempArr.splice ( randomIndex, 1);
                    }

                    //and set..
                    let counter = 0;

                    this.tilesContainer.iterate ( function ( tile ) {

                        this.tweens.add ({
                            targets : tile,
                            x : this.grid [gridArr [counter]].x,
                            y : this.grid [gridArr [counter]].y,
                            duration : 500,
                            ease : 'Power3' 
                        });

                        tile.gp = gridArr [counter];

                        counter++;

                    }, this);

                  
                }
                
            }
            generateFrames ( total, len ) {


                //let total = this.row * this.col;

                let arr = [];
                for ( let i=0; i<len; i++) {
                    arr.push ( i );
                }

                let tmp_arr = [];

                while (tmp_arr.length < (total/2) ) {

                    let randomIndex = Math.floor ( Math.random() * arr.length );

                    tmp_arr.push ( arr[randomIndex] );

                    arr.splice ( randomIndex, 1);

                }

                arr = [];

                for ( let i=0; i<tmp_arr.length ; i++) {
                    arr.push ( tmp_arr[i] );
                    arr.push ( tmp_arr[i] );
                }

                //return arr;

                let finArr = [];
                while ( arr.length > 0 ) {

                    let randomIndex = Math.floor ( Math.random() * arr.length );

                    finArr.push ( arr[randomIndex] );

                    arr.splice ( randomIndex, 1);
                }

                return finArr;
                
            }
            analyzeScore () {


                //bestScores & bestTime..
                let currentBestMove = parseInt ( _bestScores.moves [ this.gmLvl - 1 ] );

                let currentBestTime = parseInt ( _bestScores.time [ this.gmLvl - 1 ] );

                //..
                let lesserTime = this.totalSeconds < currentBestTime;

                let sameTimeLesserMoves = ( this.totalSeconds == currentBestTime ) && (this.moves < currentBestMove);

                if ( currentBestTime == 0 || lesserTime || sameTimeLesserMoves ) {

                    _bestScores.time [this.gmLvl - 1] = this.totalSeconds;

                    _bestScores.moves [this.gmLvl - 1] = this.moves;

                    let topass = { 
                        'bestTime' : _bestScores.time.toString (), 
                        'bestScores' : _bestScores.moves.toString ()  
                    }

                    this.facebook.saveData ( topass );
                }

                return {
                    'beat' : currentBestTime == 0 || lesserTime || sameTimeLesserMoves,
                    'prevTime' : currentBestTime,
                    'prevMove' : currentBestMove
                }

            }
            showInitPrompt () {
                
                this.isInitPrompted = true;

                this.startLevelContainer = this.add.container ( 0, 0 ).setVisible(false);

                let smREct = this.add.rectangle (_gW/2, _gH/2, _gW, _gH *0.65 ).setInteractive ();

                let img = this.add.image (_gW/2, _gH/2, 'prompt').setScale(_scale) ;


                //titleTxt 
                let titleTxtConfig = { color : '#fff', fontSize : 30 * _scale, fontFamily : 'Oswald' };

                let titleTxt = this.add.text ( 110*_scale, 498*_scale, 'Current Record', titleTxtConfig ).setOrigin (0, 0.5);

                titleTxt.setShadow (0,2,'#000', 2, false, true);

                //text..
                let txtConfiga = { color : "#fff", fontFamily : 'Oswald', fontSize : 40*_scale };

                let txtval = 'Time: ' + this.convertToTime(_bestScores.time [this.gmLvl -1]) + '   Moves: ' +  this.convertMove (_bestScores.moves [this.gmLvl - 1]);

                let txt = this.add.text ( _gW/2, 610*_scale, txtval,  txtConfiga ).setOrigin ( 0.5 );

            
                //btn...
                let btn = this.add.image ( _gW/2, 720 * _scale, 'prompt_btns').setScale (_scale).setInteractive();

                btn.on ('pointerover', function () {
                    this.setFrame (1);
                });
                btn.on ('pointerout', function () {
                    this.setFrame (0);
                });
                btn.on ('pointerup', function () {
                    this.setFrame (0);
                });
                btn.on ('pointerdown', function () {

                    this.playSound ('clicka');
                    this.startLevel();

                }, this);
                
                this.startLevelContainer.add ( [ smREct, img, titleTxt, txt, btn ]);

                this.time.delayedCall (500, function () {
                    this.startLevelContainer.setVisible (true)
                }, [], this);

               

            }
            removeInitPrompt () {

                this.isInitPrompted = false;

                this.startLevelContainer.destroy();

            }
            showPrompt ( data ) {

                this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.7).setOrigin (0).setInteractive();

                this.promptScreen = this.add.container (-_gW, 0).setDepth (999);

                //prompt bg..
                let img = this.add.image (_gW/2, _gH/2, 'prompt').setScale(_scale);

                this.promptScreen.add (img);

                if ( !data.beat ) {

                    //text..

                    let txtConfig = { color : '#fff', fontSize : 45 * _scale, fontFamily : 'Coda' };

                    let str = this.gmLvl < 3 ? "Awesome!" : "Congratulations!";

                    let txt = this.add.text ( _gW/2, 600 * _scale, str, txtConfig ).setOrigin (0.5);

                    this.promptScreen.add (txt);

                }else {


                    //titleTxt 
                    let titleTxtConfig = { color : '#fff', fontSize : 30 * _scale, fontFamily : 'Oswald' };

                    let titleTxt = this.add.text ( 110*_scale, 498*_scale, 'New Record!', titleTxtConfig ).setOrigin (0, 0.5);

                    titleTxt.setShadow (0,2,'#000', 2, false, true);


                    let x_logo = 160*_scale,  y_new = 582*_scale, y_old = 645*_scale;

                    //logo..
                    let endlogo_new = this.add.sprite ( x_logo, y_new, 'endlogo', 1 ).setScale (_scale);

                    let endlogo_old = this.add.sprite ( x_logo, y_old, 'endlogo', 0 ).setScale (_scale);

                    
                    //records..
                    let xp = 215 * _scale, upr = 2 * _scale;

                    let txtConfigb = { color : '#fff', fontSize : 32 * _scale, fontFamily : 'Oswald' };

                    let txtvala = 'Time: '+ this.convertToTime(this.totalSeconds) + '  Moves: ' + this.convertMove ( this.moves);

                    let txtnew = this.add.text ( xp, y_new-upr , txtvala, txtConfigb ).setOrigin (0, 0.5);

                    let txtvalb = 'Time: '+ this.convertToTime(data.prevTime) + '  Moves: ' + this.convertMove (data.prevMove);

                    let txtold = this.add.text ( xp, y_old-upr, txtvalb, txtConfigb ).setOrigin (0, 0.5).setColor ('#6e6e6e');

                    this.promptScreen.add ([ titleTxt, endlogo_new, endlogo_old, txtnew, txtold ]);

                }
                

                

                //btn..
                let btnFrame = this.gmLvl < 3 ? 2 : 4;

                let btn_y = data.beat ? 742 * _scale : 720 * _scale;

                let btn = this.add.image (_gW/2, btn_y, 'prompt_btns', btnFrame ).setData('id', btnFrame ).setScale(_gW/720).setInteractive();

                btn.on('pointerup', function () {
                    this.setFrame ( this.getData('id'));
                });
                btn.on('pointerout', function () {
                    this.setFrame ( this.getData('id'));
                });
                btn.on('pointerover', function () {
                    this.setFrame ( this.getData('id') + 1);
                });
                btn.on('pointerdown', function () {
                    
                    //this.setFrame ( this.getData('id') + 1);
                    this.scene.playSound ('clicka');

                    if ( this.scene.gmLvl != 3 ) {
                        this.scene.removePrompt ();
                    }else {
                        this.scene.leaveGame();
                    }

                });

                this.promptScreen.add (btn);

                this.tweens.add ({
                    targets : this.promptScreen,
                    x : 0,
                    duration : 300,
                    delay : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic'
                });

                this.time.delayedCall ( 300, this.playSound, [ data.beat ? 'home' : 'alternate', 0.4 ], this );


            }
            removePrompt () {

                let _this = this;

                this.tweens.add ({

                    targets : this.promptScreen,
                    x : _gW,
                    duration : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic',

                    onComplete : function () {

                        _this.promptScreen.destroy ();
                        _this.bgRect.destroy();

                        if (_this.gmLvl < 3) {
                            _this.gmLvl += 1;
                            _this.changeLevel ();
                        }

                    }
                });

            }
            startClock () {

                let timedEvent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, repeat: 9 });

                this.input.on('pointerdown', function () {

                    if (timedEvent.paused)
                    {
                        timedEvent.paused = false;
                    }
                    else
                    {
                        timedEvent.paused = true;
                    }
                });
            }
            showBestScores () {

                this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.7).setOrigin (0).setInteractive();

                this.bgRect.on ('pointerdown', function () {

                    this.scene.playSound ('clicka');
                    
                    this.scene.removeScores ();
                });

                this.promptScreen = this.add.container (-_gW, 0).setDepth (999);

                let img = this.add.image (_gW/2, _gH/2, 'table').setScale(_gW/720);

                this.promptScreen.add (img);

                let itemW = 568 * _scale,
                    itemH = 78 * _scale,
                    itemX = 76 * _scale,
                    itemY = 587 * _scale;

                let txtConfiga = { color : '#333', fontSize : itemH * 0.5, fontFamily : 'Oswald'  };

                for ( let i = 0; i < 3; i++ ) {

                    let miniCont = this.add.container ( itemX, itemY + i * ( itemH ) ).setName ('item' + i );

                    let bgRect = this.add.rectangle ( 0, 0, itemW, itemH ).setOrigin (0); //setStrokeStyle (1, 0x0a0a0a);

                    let lvl = this.add.text ( itemW * 0.11, itemH/2, (i+1) < 10 ? '0' + (i+1) : i+1, txtConfiga  ).setOrigin (0.5);


                    let timeval = this.convertToTime (_bestScores.time [i]);
                    
                    let timetxt = this.add.text ( itemW * 0.49 , itemH/2, timeval, txtConfiga  ).setOrigin (0.5);


                    let val = _bestScores.moves [ i ];

                    let movestxt = this.add.text ( itemW * 0.88, itemH/2, val < 10 ? '0'+val : val, txtConfiga  ).setOrigin (0.5);

                    miniCont.add ([bgRect, lvl, timetxt, movestxt]);

                    this.promptScreen.add (miniCont);

                }

                this.tweens.add ({
                    targets : this.promptScreen,
                    x : 0,
                    duration : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic'
                });

                this.gameTimer.paused=true;

            }
            removeScores () {

                let _this = this;

                this.tweens.add ({

                    targets : this.promptScreen,
                    x : _gW,
                    duration : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic',
                    onComplete : function () {

                        _this.promptScreen.destroy ();
                        _this.bgRect.destroy();

                        if ( !_this.isInitPrompted ) {
                            _this.gameTimer.paused=false;
                        } else {
                            _this.startLevelContainer.setVisible ( true );
                        }

                    }

                });

            }
            controlsClick ( id ) {

                this.playSound ('clicka');

                this.gameTimer.destroy();

                switch (id) {
                    case 0:
                       
                        this.leaveGame();
                    break;
                    case 1: 
                        if ( this.gmLvl == 1 ) return;


                        this.gmLvl += -1;

                        this.changeLevel ();
                        break;
                    case 2:
                        if ( this.gmLvl == 3 ) return;
                        this.gmLvl += 1;
                        this.changeLevel ();
                        break;
                }

            }
            changeLevel () {
                
                for ( let i in this.skipBtn ) {
                    this.skipBtn[i].disableInteractive ().setAlpha (0.5);
                }

                if ( this.isInitPrompted ) this.removeInitPrompt ();
                
                this.removeTiles();

                this.initGame ();

            }
            convertMove ( mov) {

                if ( parseInt ( mov ) < 10 ) return '0' + mov;

                return mov;

            }
            convertToTime ( sec ) {

                let min = Math.floor ( sec/60);

                let hrs = Math.floor (min/60);

                let str_sec = (sec%60) < 10 ? '0' + (sec%60) : (sec%60);

                let str_min = (min%60) < 10 ? '0' + (min%60) : (min%60);

                let str_hrs = hrs < 10 ? '0' + hrs : hrs;
                
                return str_hrs + ":" + str_min +":" + str_sec;

            }
            playSound (id , vol = 0.6) {
            this.music.play (id, { volume : vol })
            }
            leaveGame () {

                this.facebook.removeListener ('savedata');
                this.facebook.removeListener ('savedatafail');

                this.gameTimer.destroy ();

                this.bgmusic.stop ();

                this.scene.start ('HomeScreen');

            }

        }

        class TileRaw extends Phaser.GameObjects.Container {

            constructor ( scene, id, x, y, width, height, cnt, gp, tn ) {

                super ( scene, x, y );

                this.setSize ( width, height ).setName (id);

                this.id = id;
                this.cnt = cnt;
                this.gp = gp;
                this.isOpen = false;
                this.isRevealed = false;

                let tileimg = scene.add.image ( 0, 0, 'tiles', 0 ).setScale ( width/158 );

                let contimg = scene.add.image ( 0,0, 'thumbs', cnt ).setScale ( width/75 *0.9 ).setVisible ( false );

                //tn < 10 ? '0'+tn : tn
                let tileNumber = scene.add.text ( width*0.35, -height*0.4, tn, { color:'#fff', fontSize: height * 0.25, fontFamily : 'Oswald'}).setOrigin (1, 0);

                tileNumber.setShadow (0,2,'#f00', 2, false, true);

                this.add ( [tileimg, contimg, tileNumber ]);

                scene.add.existing(this);

            }
            flip ( open = true ) {

                this.isOpen = open;

                this.getAt (0).setFrame ( open ? 2 : 0 );
                this.getAt (1).setVisible (open);
                this.getAt (2).setVisible (!open);

                return this;
            }


        } 

        var config = {

            type: Phaser.AUTO,
            width: _gW,
            height: _gH,
            backgroundColor: '#f5f5f5',
            parent:'game_div',
            scene: [ Preloader, HomeScreen, GameScreen ]

        };

        new Phaser.Game(config);

    });

}