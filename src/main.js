
window.onload = function () {
    
    FBInstant.initializeAsync().then(function() {

        let maxW = 720;
    
        let contW = window.innerWidth, 
        
            contH = window.innerHeight;
    
        let tmpWidth = contW > maxW ? maxW : contW,
    
            tmpHeight = Math.ceil(tmpWidth * 16/9);
    
        if ( tmpHeight >= contH ) {
    
            _gH = contH;
            _gW = Math.ceil(_gH * 9/16);
    
            //console.log ( 'game dimensions adjusted by screen height' )
    
        }else {
    
            _gW = tmpWidth;
            _gH = tmpHeight;
    
            //console.log ( 'game dimensions adjusted by screen width' )
        }
    
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
    
                this.load.spritesheet ('btns', 'assets/images/btns.png', { frameWidth: 95, frameHeight: 95 });
    
                this.load.spritesheet ('btn_thumbs', 'assets/images/btn_thumbs.png', { frameWidth: 50, frameHeight: 50 });
    
                this.load.image ('bg', 'assets/images/bg.png');
    
                this.load.image ('bg1', 'assets/images/bg1.png');
    
                this.load.image ('title', 'assets/images/title.png');
    
                this.load.image ('table', 'assets/images/table.png');
    
                this.load.image ('panel', 'assets/images/panel.png');
    
                this.load.image ('prompt', 'assets/images/prompt.png');
    
                this.load.image ('leaderboard', 'assets/images/leaderboard.png');
    
                this.load.image ('item', 'assets/images/item.png');
    
                this.load.image ('blank_img', 'assets/images/blank_img.png');
    
                this.load.image ('instructions', 'assets/images/instructions.png');
    
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
                //...
            }
            create () 
            {

                
                this.universalSoundIsOff = false;
                
                this.lvlCount = 8;

                _bestScores.moves = [];
                _bestScores.time = [];
                
                for ( let i=0; i<this.lvlCount; i++) {
                    _bestScores.moves.push (0);
                    _bestScores.time.push (0);
                }

                this.initHomeSound ();

                this.initHomeInterface ();

                this.getPlayerData ();

                //this.resetData ();

            }
            initHomeSound () {

                this.bgmusic = this.sound.add('bgsound').setVolume(0.1).setLoop(true);
                this.bgmusic.play();
                
                this.music = this.sound.addAudioSprite('sfx').setVolume(0.4);

            }
            initHomeInterface () {

                let bg = this.add.image (_gW/2, _gH/2, 'bg').setScale (_gW/720);

                let title = this.add.image (_gW/2, _gH/2, 'title').setScale (_gW/720);

                //set player details..

                let ry = 560*_scale, rz = 120 * _scale;

                this.add.rectangle ( _gW/2, ry, rz, rz, 0xdedede, 1 ).setStrokeStyle ( 3, 0xf5f5f5 );

                this.add.image ( _gW/2, ry, 'blank_img').setDisplaySize( rz, rz);

                this.add.text (_gW/2, ry + (90*_scale), 'Welcome, ' + this.facebook.playerName + '!', { fontFamily:'Oswald', fontSize: 28*_scale, color : '#fff' }).setOrigin (0.5);

                this.load.image ('dude', this.facebook.playerPhotoURL );

                this.load.once('complete', function () {

                    let img = this.add.image ( _gW/2, ry, 'dude').setDisplaySize( rz, rz ).setAlpha(0);

                    this.tweens.add ({
                        targets : img,
                        alpha : 1,
                        duration : 500,
                        ease : 'Power2'
                    });

                }, this);
                
                this.load.start();


                //buttons..
                let bz = 95 * _scale,
                    bs = bz*0.1,
                    bx = (_gW - ((bz * 2) + bs))/2 + bz/2,
                    by = 1204*_scale;

                for ( let i = 0; i < 2; i++ ) {

                    let cont = this.add.container ( bx + i * ( bz + bs), by ).setSize ( bz, bz ).setData('id', i ).setInteractive();

                    let btn = this.add.sprite ( 0, 0, 'btns', 0 ).setScale (_scale);

                    let btn_img = this.add.sprite ( 0, 0, 'btn_thumbs', i == 0 ? 1 : 3 ).setScale (_scale);

                    cont.add ( [btn, btn_img] );

                    cont.on ('pointerover', function () {
                        this.getAt(0).setFrame ( 1 );
                    });
                    cont.on ('pointerout', function () {
                        this.getAt(0).setFrame ( 0 );
                    });
                    cont.on ('pointerup', function () {
                        this.getAt(0).setFrame ( 0 );
                    });
                    cont.on ('pointerdown', function () {
                        //..
                        switch ( cont.getData('id') ) {

                            case 0:

                                this.universalSoundIsOff = !this.universalSoundIsOff;

                                this.playSound ('clicka');

                                if ( this.bgmusic.isPaused ) {

                                    this.bgmusic.resume()
                                    
                                    cont.getAt(1).setFrame ( 1 )

                                }else {

                                    this.bgmusic.pause();

                                    cont.getAt(1).setFrame ( 2 )
                                }

                                break;
                            case 1 :

                                this.showInstructions ()

                                this.playSound ('clicka');

                                break;

                        }

                    }, this );
                    
                }

                //table
                let table = this.add.image (_gW/2, 920*_scale, 'table').setScale (_scale);


                //click here to start btn..
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
                
                    this.playSound ('clicka');

                    this.initGame ();
            
                }, this );

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

                this.time.delayedCall ( delayEntry, this.playSound, ['move'], this);

            }   
            resetData () {

                let playerRecordData = {
                    playerTime : _bestScores.time.toString(),
                    playerMove : _bestScores.moves.toString(),
                }

                this.facebook.saveData(playerRecordData);
            }     
            getPlayerData () {

                this.facebook.getData(['playerTime', 'playerMove']);

                this.facebook.once('getdata', function (data) {

                    this.updateStats (data);

                    this.showPlayerData ();

                }, this);

                this.facebook.once ('getdatafail', function ( error ) {
                    
                    this.showPlayerData ();

                });

            }
            showPlayerData  () {

                //initial player data...
                   
               
                let itemW = _gW,
                    itemH = 59 * _scale,
                    itemX = 0,
                    itemY = 835 * _scale;

                let contntH = this.lvlCount * itemH,
                    contnrH = itemH * 5;

                this.dataContainer = this.add.container ( 0, 0 );
                
                
                let txtConfiga = { color : '#333', fontSize : itemH * 0.5, fontFamily : 'Oswald'  };

                for ( var i = 0; i < this.lvlCount ; i++ ) {

                    let miniCont = this.add.container ( itemX, itemY + i * ( itemH ) ).setName ('item' + i );

                    let bgRect = this.add.rectangle ( 0, 0, itemW, itemH).setOrigin (0); //setStrokeStyle(1, 0x0a0a0a);

                    let lvl = this.add.text ( itemW * 0.21, itemH/2, (i+1) < 10 ? '0' + (i+1) : i+1, txtConfiga  ).setOrigin (0.5);
                    
                    let timeval = _bestScores.time[i] != 0 ? this.convertToTime ( _bestScores.time[i] ) : '--'; 

                    let timetxt = this.add.text ( itemW * 0.5, itemH/2, timeval, txtConfiga ).setOrigin (0.5).setName ('timetxt');

                    let movesVal = _bestScores.moves[i] != 0 ? _bestScores.moves[i] : '--';

                    let movestxt = this.add.text ( itemW * 0.79, itemH/2, movesVal, txtConfiga ).setOrigin (0.5).setName ('movestxt');

                    miniCont.add ([bgRect, lvl, timetxt, movestxt]);

                    //console.log ( i );
                    this.dataContainer.add (miniCont);

                }


                var zone = this.add.zone(0, itemY, _gW, contnrH).setOrigin(0).setInteractive();

                zone.on('pointermove', function (pointer) {

                    if (pointer.isDown)
                    {

                        let dist = pointer.position.y - pointer.prevPosition.y;
                        
                        this.dataContainer.y += ( dist * 3 );

                        this.dataContainer.y = Phaser.Math.Clamp(this.dataContainer.y, -( contntH - contnrH ), 0);
                        
                    }   
                    

                }, this );
                    
                    


                //setMask..
                var shape = this.make.graphics();

                shape.beginPath();
           
                shape.fillRect( itemX, itemY, _gW, 298 * _scale );

                var mask = shape.createGeometryMask(); 

                this.dataContainer.setMask ( mask )



            }
            updateStats ( data ) {

                console.log ( data );

                if ( data.hasOwnProperty ('playerTime') ) {

                    let timeArr = data.playerTime.split(',');

                    _bestScores.time = timeArr;

                    if ( _bestScores.time.length < this.lvlCount ) {
                        while ( _bestScores.time.length < this.lvlCount  ) {
                            _bestScores.time.push ( 0 );
                        }
                    }
                }

                if ( data.hasOwnProperty ('playerMove') ) {

                    let movesArr = data.playerMove.split(',');

                    _bestScores.moves = movesArr;
            
                    if ( _bestScores.moves.length < this.lvlCount ) {
                        while ( _bestScores.moves.length < this.lvlCount  ) {
                            _bestScores.moves.push ( 0 );
                        }
                    }

                }

            }
            showInstructions() {

                this.bgRect = this.add.rectangle ( 0,0, _gW, _gH, 0x0a0a0a, 0.9).setOrigin(0).setInteractive();

                this.instructionCont = this.add.container ( 0, 0 );

                
                let img = this.add.image ( _gW/2, _gH/2, 'instructions').setScale (_scale);

                let close = this.add.image ( 620*_scale, 150*_scale, 'btn_thumbs', 0 ).setScale (_scale).setInteractive ();

                close.on ( 'pointerover', function () {
                    this.setTint ( 0xffff99 );
                });
                close.on ( 'pointerout', function () {
                    this.clearTint();
                });
                close.on ( 'pointerup', function () {
                    this.clearTint();
                });
                close.on ( 'pointerdown', function () {

                    this.playSound ('clicka');

                    this.removeInstructions();

                }, this);

                this.instructionCont.add ( [ img, close ]);


            }
            removeInstructions () {

                this.bgRect.destroy();

                this.instructionCont.destroy();

            }
            convertToTime ( sec ) {

                let min = Math.floor ( sec/60);

                let hrs = Math.floor (min/60);

                let str_sec = (sec%60) < 10 ? '0' + (sec%60) : (sec%60);

                let str_min = (min%60) < 10 ? '0' + (min%60) : (min%60);

                let str_hrs = hrs < 10 ? '0' + hrs : hrs;
                
                return str_hrs + ":" + str_min +":" + str_sec;

            }
            playSound ( snd, vol = 0.5 ) {

                if ( !this.universalSoundIsOff ) this.music.play ( snd, { volume: vol });

            }
            initGame () {
                
                this.load.off();

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

                this.gmData = [ 
                    { r : 5, c : 4 }, { r : 5, c : 4 }, { r : 5, c : 4 }, { r : 5, c : 4 },
                    { r : 6, c : 5 }, { r : 6, c : 5 }, { r : 7, c : 6 },  
                    { r : 7, c : 6 } 
                ];
    
                this.lvlCount = this.gmData.length;

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
                    fontSize : 35 * _scale,
                    shadow: {
                        offsetX: 0,
                        offsetY: 2,
                        color: '#000',
                        blur: 3,
                        stroke: false,
                        fill: true
                    },
                }

                let txty = 150 * _scale;
                
                this.lvlText = this.add.text ( 68*_scale, txty , 'Level: 1', configlvlTxt ).setOrigin (0,0.5);
                
                this.movText = this.add.text ( 230*_scale, txty, 'Moves: 0', configlvlTxt ).setOrigin (0,0.5);

                this.timerText = this.add.text ( 430*_scale, txty, 'Timer: 00:00:00', configlvlTxt ).setOrigin ( 0, 0.5);
                

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

                this.inite = false;

                this.openTiles = [];
                
                let r = this.gmData[this.gmLvl - 1].r,
                    c = this.gmData[this.gmLvl - 1].c;

                this.scoreTotal = r * c / 2;

                this.isInitPrompted = false;

                this.endGame = false;

                this.score = 0;

                this.moves = 0;

                this.totalSeconds = 0;

                this.lvlText.text = 'Level: ' + this.gmLvl;
                this.movText.text = 'Moves: 0';
                this.timerText.text = 'Time: 00:00:00';

                this.initFacebookLeaderBoard ('mtiles_'+ this.gmLvl );

                this.createTiles ( r, c );

                this.showInitPrompt ();

                this.controlBtns[1].disableInteractive().setAlpha(0.3);
                this.controlBtns[2].disableInteractive().setAlpha(0.3);

                this.time.delayedCall ( 700, function () {
                    if ( this.gmLvl > 1 ) this.controlBtns[1].setInteractive().setAlpha(1);
                    if ( this.gmLvl < this.lvlCount ) this.controlBtns[2].setInteractive().setAlpha(1);
                }, [], this);

                this.gameTimer = this.time.addEvent ({ delay:1000, loop:true, callback: this.showTimer, callbackScope:this, paused:true });
                


            }
            initFacebookLeaderBoard ( name ) {

                //this.isLeaderboardLoaded = true;

                this.isLeaderboardLoaded = false;

                this.facebook.once ('getleaderboard', function (leaderboard)
                {
                    console.log ( 'get leaderboard successful: ' + name  );
                    
                    this.leaderboard = leaderboard;

                    this.isLeaderboardLoaded = true;

                }, this);

                this.facebook.getLeaderboard( name );
                
                
                this.facebook.once('savedata', function (data) {
                    console.log ('save data successful : gamescreen', data );
                });
                
                this.facebook.once('savedatafail', function (error) {
                    console.log ('error saving data : gamescreen');
                }); 
            

                
            }
            showTimer () {

                this.totalSeconds += 1;

                this.tick.play();

                this.timerText.setText ( 'Time: ' + this.convertToTime ( this.totalSeconds) );

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

                for ( let i = 0 ; i < row * col; i++ ) {

                    let ix = Math.floor ( i/col), iy = i%col;

                    let xp = sX + iy * (tileW + tileS),
                        yp = sY + ix * (tileW + tileS);

                    this.grid.push ({ 
                        x:xp, 
                        y:yp 
                    });

                    let tileR = new TileRaw ( this, 'tile'+i, _gW/2, _gH/2, tileW, tileW, frames [i], i, ix, iy );

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
                this.movText.text = 'Moves: ' + this.moves;

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

                    //this.scoreTotal

                    if ( this.score >= this.scoreTotal ) {

                        this.endGame = true;

                        this.gameTimer.destroy();

                        let datatopass = this.analyzeScore ();

                        this.showPrompt( datatopass );

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

                let drt = 300;
                
                let row = this.gmData[this.gmLvl-1].r, 
                    col = this.gmData[this.gmLvl-1].c;
    
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
                else if ( this.gmLvl == 2 ) {
    
                    let toSwitch = [];
    
                    while ( toSwitch.length < 2 ) {
                        
                        var randomTileNumber = Math.floor ( Math.random() * (row*col) );
    
                        var tempTile = this.tilesContainer.getByName ( 'tile' + randomTileNumber ) ;
    
                        if ( !tempTile.isOpen && !tempTile.isRevealed ) {
                            toSwitch.push ( tempTile.id );
                        }
    
                    }
    
                    for ( let i = 0; i < 2; i++ ) {
    
                        let tile1 = this.tilesContainer.getByName ( this.openTiles [i] );
    
                        let tile2 = this.tilesContainer.getByName ( toSwitch [i] );
    
                        let grid1 = tile1.gp,
                            grid2 = tile2.gp;
                        
                        this.tilesContainer.bringToTop ( tile1 );
                        this.tilesContainer.bringToTop ( tile2 );
    
                        this.tweens.add ({
                            targets : tile1,
                            x : this.grid [grid2].x,
                            y : this.grid [grid2].y,
                            duration : drt,
                            ease : 'Power2' 
                        });
                        this.tweens.add ({
                            targets : tile2,
                            x : this.grid [grid1].x,
                            y : this.grid [grid1].y,
                            duration : drt,
                            ease : 'Power2' 
                        });
        
                        tile1.gp = grid2;
                        tile2.gp = grid1;
                        
                    }
    
                } 
                else if ( this.gmLvl == 3 ) {
    
                    let top = (row*col) - 1;
    
                    let cnt = 0;
    
                    this.tilesContainer.iterate ( function ( tile )  {
    
                        let dest = top - tile.gp;
    
                        tile.gp = dest;
    
                        //this.tilesContainer.bringToTop ( tile );
    
                        this.tweens.add ({
                            targets : tile,
                            x : this.grid [dest].x,
                            y : this.grid [dest].y,
                            duration : drt,
                            ease : 'Power3', 
                            delay : cnt * 5
                        });
    
                        cnt++;
    
                    }, this);
    
                }
                else if ( this.gmLvl == 4 ) {
    
                    let dest = 0;
    
                    let cnt = 0;
    
                    this.tilesContainer.iterate ( function (tile) {
    
                        
                        if ( tile.r >= 0 && tile.r < 2 && tile.c >= 0 && tile.c < 2 ) { //outside
    
                            
                            dest =  ((tile.r+3) * col) + tile.c+2;
    
                            tile.setGrid ( tile.r+3, tile.c+2 );
    
                        }
                        else if ( tile.r >= 0 && tile.r < 2 && tile.c >= 2 && tile.c < col ) { //outside
    
                            dest =  ((tile.r+3) * col) + tile.c -2;
    
                            tile.setGrid ( tile.r+3, tile.c-2 )
                        }
                        else if ( tile.r >= 3 && tile.r < row && tile.c >= 0 && tile.c < 2 ) { //outside
    
                            dest =  ((tile.r-3) * col) + tile.c + 2;
    
                            tile.setGrid ( tile.r - 3, tile.c + 2 )
    
                        }
                        else if ( tile.r >= 3 && tile.r < row && tile.c >= 2 && tile.c < col ) { //outside
    
                            dest =  ((tile.r-3) * col) + tile.c-2;
    
                            tile.setGrid ( tile.r -3 , tile.c - 2 )
    
                        }
                        else if ( tile.r == 2 && tile.c >= 0 && tile.c < 2 ) { //outside
    
                            dest =  (tile.r * col) + tile.c + 2;
    
                            tile.setGrid ( tile.r, tile.c + 2 )
    
                        }
                        else if ( tile.r == 2 && tile.c >= 2 && tile.c < col ) { //outside
    
                            dest =  (tile.r * col) + tile.c - 2;
    
                            tile.setGrid ( tile.r, tile.c - 2 )
    
                        }
    
                        
                        this.tweens.add ({
                            targets : tile,
                            x: this.grid [dest].x, 
                            y : this.grid [dest].y,
                            duration : drt,
                            ease : 'Power2',
                            delay: cnt * 5,
                        }); 
    
                        cnt ++;
    
                    }, this );
    
                }
                else if ( this.gmLvl == 5 ) {
    
                    let style = Math.floor ( Math.random() * 2 );
    
                   
    
                    //console.log ( 'ss', style );
    
                    let dest = 0;
    
                    this.tilesContainer.iterate (function ( tile ) {
    
                        if ( style == 0 ) {
    
                            if ( tile.r % 2 == 0 && tile.c == (col - 1)  && tile.r < (row - 1)) {
    
                                dest =  ((tile.r + 1 )*col) + tile.c;
        
                                tile.setGrid ( tile.r + 1, tile.c )
        
                            }
                            else if ( tile.r % 2 == 1 && tile.c == 0 && tile.r < (row- 1) ) {
        
                                dest =  ((tile.r + 1 )* col) + tile.c;
        
                                tile.setGrid ( tile.r + 1, tile.c )
        
                            }
                            else if ( tile.r % 2 == 0 && tile.c < (col - 1)) {
        
                                dest = (tile.r*col) + (tile.c + 1) ;
        
                                tile.setGrid ( tile.r , tile.c + 1)
        
                            }
                            else if ( tile.r % 2 == 1 && tile.c > 0 ) {
        
                                dest = (tile.r *col) + (tile.c - 1) ;
        
                                tile.setGrid ( tile.r, tile.c - 1)
        
                            }
                            else {
                                dest = 0;
                                tile.setGrid ( 0, 0 )
                            }
    
                        }else {
    
                            if ( tile.r % 2 == 1 && tile.c == (col-1)  && tile.r > 0 ) {
    
                                dest =  ((tile.r - 1 )* col) + tile.c;
        
                                tile.setGrid ( tile.r - 1, tile.c )
        
                            }
                            else if ( tile.r % 2 == 0 && tile.c == 0 && tile.r > 0 ) {
        
        
                                dest =  ((tile.r - 1 )* col) + tile.c;
        
                                tile.setGrid ( tile.r - 1, tile.c )
        
                            }
                             else if ( tile.r % 2 == 0 && tile.c > 0 ) {
        
                                dest = (tile.r*col) + (tile.c - 1) ;
        
                                tile.setGrid ( tile.r , tile.c - 1)
                            }
                            else if ( tile.r % 2 == 1 && tile.c < (col - 1) ) {
        
                                
                                dest = (tile.r *col) + (tile.c + 1) ;
        
                                tile.setGrid ( tile.r, tile.c + 1)
        
                            }
                            else {
        
                                if ( row % 2 == 0 ) {
        
                                    dest = ( row * col ) - col;
        
                                    tile.setGrid ( row - 1, 0 )
                                    
                                }else {
        
                                    dest = ( row * col ) - 1
    
                                    tile.setGrid ( row - 1, col - 1 )
        
                                }   
                                
                            }
    
                        }
                       
                        this.tweens.add ({
                            targets : tile,
                            x:  this.grid [dest].x, 
                            y : this.grid [dest].y,
                            duration : 300,
                            ease : 'Power2'
                        }); 
    
    
                    }, this );
    
    
                }
                else if ( this.gmLvl == 6 ) {
    
                    let dest = 0, style = 0;
                
                    let tile1 = this.tilesContainer.getByName (this.openTiles[0]),
                        tile2 =  this.tilesContainer.getByName (this.openTiles[1]);
    
                    if ( tile1.r == tile2.r ) {
                        style = 0
                    }else if ( tile1.c == tile2.c) {
                        style = 1;
                    }else {
                        style = Math.floor ( Math.random() * 2 );
                    }
    
                    let randomArr = this.randomSet( style == 0 ? col : row );
    
                    this.tilesContainer.iterate ( function (tile) {
    
                        if ( style == 0 ) {
    
                            dest = ( tile.r * col) + randomArr [ tile.c ]; 
    
                            tile.setGrid ( tile.r, randomArr [ tile.c ])
    
                        }else {
    
                            dest = ( randomArr[tile.r]* col) + tile.c; 
    
                            tile.setGrid ( randomArr[tile.r], tile.c )
    
                        }
                
                        this.tweens.add ({
                            targets : tile,
                            x: this.grid [dest].x, 
                            y : this.grid [dest].y,
                            duration : 300,
                            ease : 'Power2'
                        }); 
                        
                    }, this );
    
    
                }
                else if ( this.gmLvl == 7 ) {
    
                    let dest = 0;
    
                    this.tilesContainer.iterate ( function (tile) {
    
                        if ( tile.r == 0 && tile.c < col - 1 ) { //outside
    
                            dest =  (tile.r * col) + tile.c + 1;
    
                            tile.setGrid ( tile.r, tile.c + 1 )
    
                        }
                        else if ( tile.r == row - 1 && tile.c > 0 ) {
    
                            //tile.getAt (0).setFillStyle ( 0xff0000, 1 );
    
                            dest =  (tile.r * col) + tile.c - 1;
    
                            tile.setGrid ( tile.r, tile.c - 1 )
    
                        }
                        else if ( tile.r > 0 && tile.c == 0 ) {
    
                            //tile.getAt (0).setFillStyle ( 0x00ff00, 1 );
    
                            dest =  ((tile.r - 1) * col) + tile.c;
    
                            tile.setGrid ( tile.r - 1, tile.c )
    
                        }
                        else if ( tile.r < row - 1 && tile.c == col - 1 ) { 
    
                            //tile.getAt (0).setFillStyle ( 0x00ff00, 1 );
    
                            dest =  ((tile.r + 1) * col) + tile.c;
    
                            tile.setGrid ( tile.r + 1, tile.c )
    
                        }
                        else if ( tile.r == 1 && tile.c > 1 && tile.c < col - 1 ) { //inside
    
                            //tile.getAt (0).setFillStyle ( 0xff0000, 1 );
    
                            dest =  (tile.r * col) + tile.c - 1;
    
                            tile.setGrid ( tile.r, tile.c - 1 )
    
                        }
                        else if ( tile.r == row - 2 && tile.c > 0 && tile.c < col - 2 ) {
    
                            //tile.getAt (0).setFillStyle ( 0xff0000, 1 );
    
                            dest =  (tile.r * col) + tile.c + 1;
    
                            tile.setGrid ( tile.r, tile.c + 1 )
    
                        }
                        else if ( tile.r > 0 && tile.r < row - 2 && tile.c == 1 ) {
    
                            //tile.getAt (0).setFillStyle ( 0x00ff00, 1 );
    
                            dest =  ((tile.r+1) * col) + tile.c;
    
                            tile.setGrid ( tile.r + 1, tile.c )
    
                        }
                        else if ( tile.r > 1 && tile.r < row - 1 && tile.c == col - 2 ) {
    
                            //tile.getAt (0).setFillStyle ( 0x00ff00, 1 );
    
                            dest =  ((tile.r-1) * col) + tile.c;
    
                            tile.setGrid ( tile.r -1, tile.c)
    
                        }      
                        else if ( tile.r == 2 && tile.c == col - 4 ) { //innermost
                            
                            //tile.getAt (0).setFillStyle ( 0xffff33, 1 );
    
                            dest =  (tile.r * col) + tile.c + 1;
    
                            tile.setGrid ( tile.r, tile.c + 1 )
    
                        }
                        else if ( tile.r == row - 3 && tile.c == col - 3 ) {
    
                            //tile.getAt (0).setFillStyle ( 0xffff33, 1 );
    
                            dest =  (tile.r * col) + tile.c - 1;
    
                            tile.setGrid ( tile.r , tile.c - 1)
    
                        }
                        else if ( tile.r > 2 && tile.r < row - 2 && tile.c == 2 ) {
    
                            //tile.getAt (0).setFillStyle ( 0xffff33, 1 );
    
                            dest =  ((tile.r-1) * col) + tile.c;
    
                            tile.setGrid ( tile.r - 1, tile.c )
    
                        }
                        else if ( tile.r > 1 && tile.r < row - 3 && tile.c == col - 3 ) {
    
                            //tile.getAt (0).setFillStyle ( 0x00ff00, 1 );
    
                            dest =  ((tile.r+1) * col) + tile.c;
    
                            tile.setGrid ( tile.r+1, tile.c)
    
                        }
    
                        this.tweens.add ({
                            targets : tile,
                            x: this.grid [dest].x, 
                            y : this.grid [dest].y,
                            duration : 300,
                            ease : 'Power2'
                        }); 
    
                    }, this );
    
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
            randomSet ( total ) {

                let tempArr = [];
                for ( let i = 0; i < total; i++ ) {
                    tempArr.push ( i );
                }

                let finArr = [];

                while ( finArr.length < total ) {

                    let randomIndex = Math.floor ( Math.random() * tempArr.length );

                    finArr.push ( tempArr [randomIndex] );

                    tempArr.splice ( randomIndex, 1 );

                }

                return finArr;

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


                    let playerRecordData = {
                        playerTime : _bestScores.time.toString(),
                        playerMove : _bestScores.moves.toString(),
                    }

                    this.facebook.saveData(playerRecordData);

                    this.leaderboard.setScore( this.totalSeconds, JSON.stringify( { 'moves': this.moves } ));

                }

                return {
                    'beat' : currentBestTime == 0 || lesserTime || sameTimeLesserMoves,
                    'prevTime' : currentBestTime,
                    'prevMove' : currentBestMove
                }

            }
            showLeaderboard () {

                this.isTopScoresLoaded = false;
                
                this.isPlayerScoreLoaded = false;

                this.promptBg = this.add.rectangle ( 0, 0, _gW, _gH, 0x0a0a0a, 0.9 ).setOrigin (0).setInteractive ();

                this.leaderboardContainer = this.add.container (-_gW, 0);

                let lbFrame = this.add.image ( _gW/2, _gH/2, 'leaderboard' ).setScale ( _scale );

                let configLevelTxtTxt = { color : '#000', fontSize : 40 * _scale, fontFamily: 'Oswald' };

                let levelTxt = this.add.text ( _gW/2, 309 * _scale, 'LEVEL ' + this.gmLvl , configLevelTxtTxt ).setOrigin (0.5).setName ('levelTxt');

                let configTxt = { color : '#000', fontSize : 30 * _scale, fontFamily: 'Oswald' };

                let topScoretxt = this.add.text ( _gW/2, 600 * _scale, 'Loading Top Scores..', configTxt ).setOrigin (0.5).setName ('topScoreTxt');
                
                let plyrScoretxt = this.add.text ( _gW/2, 1062 * _scale, 'Loading Player Score..', configTxt ).setOrigin (0.5).setName ('plyrScoretxt');
                
                let close = this.add.image ( 615*_scale, 150*_scale, 'btn_thumbs', 0 ).setScale (_scale).setInteractive ();

                close.on ( 'pointerover', function () {
                    this.setTint ( 0xffff99 );
                });
                close.on ( 'pointerout', function () {
                    this.clearTint();
                });
                close.on ( 'pointerup', function () {
                    this.clearTint();
                });
                close.on ( 'pointerdown', function () {

                    if ( !this.isTopScoresLoaded || !this.isPlayerScoreLoaded  ) return;
                    
                    this.playSound ('clicka');

                    this.removeLeaderBoard();

                }, this);

                this.leaderboardContainer.add ( [lbFrame, close, levelTxt, topScoretxt, plyrScoretxt] );
                
                let _this = this;

                this.tweens.add ({
                    targets : this.leaderboardContainer,
                    x : 0,
                    duration : 300,
                    ease : 'Power2',
                    onComplete : function () {
                        _this.getTopScores ();
                        _this.getPlayerScore ();
                    }
                })

                this.playSound ('move');

            }
            removeLeaderBoard () {

                let _this = this;

                this.tweens.add ({

                    targets : this.leaderboardContainer,
                    x : _gW,
                    duration : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic',

                    onComplete : function () {

                        _this.leaderboardContainer.destroy ();

                        _this.promptBg.destroy();

                        if ( _this.endGame ) {

                            if (_this.gmLvl < 3) {

                                _this.gmLvl += 1;
                                _this.changeLevel ();

                            }else {

                                //_this.gameFinished ();
                                _this.leaveGame();
                            }

                        }else {

                            if ( !_this.isInitPrompted ) {

                                _this.gameTimer.paused=false;

                            } else {

                                _this.startLevelContainer.setVisible ( true );
                            }

                        }

                        //...

                    }
                });

            }
            showTopScores ( scoresData ) {

                if ( scoresData.length > 0 ) {

                    
                    let startX = 123 * _scale,
                        starty = 357 * _scale;

                    let itemW = 477*_scale, itemH = 120 * _scale;

                    let configTxt = { color : '#000', fontFamily: 'Oswald' };

                    for ( let i in scoresData ) {

                        //console.log ( scoresData[i] );

                        let roundData = JSON.parse( scoresData[i].data );

                        let miniCont = this.add.container ( startX, starty + ( i * itemH ) ).setName ( 'cont' + i );

                        let img = this.add.image (0, 0, 'item').setOrigin(0).setScale (_scale);

                        let photoRect = this.add.rectangle ( 0,  itemH/2, itemH *0.7, itemH *0.7, 0x3a3a3a, 1 ).setOrigin(0, 0.5).setStrokeStyle(1, 0x9a9a9a );

                        let playerImg = this.add.image ( 0,  itemH/2, 'blank_img' ).setDisplaySize ( itemH *0.7, itemH *0.7 ).setOrigin (0, 0.5);

                        let rank = this.add.text ( itemW, itemH*0.1, '#' + scoresData[i].rank, configTxt ).setFontSize ( 26*_scale ).setOrigin( 1, 0 );

                        let name = this.add.text ( itemW *0.2,  itemH *0.1, scoresData[i].playerName, configTxt ).setFontSize ( 35*_scale );

                        let txt = 'Time : ' + this.convertToTime (scoresData[i].score) + '  ▪  Moves : ' + roundData.moves;

                        //let txt = 'Time : ' + this.convertToTime (scoresData[i].score) + '  ~ Moves  : ' + scoresData[i].moves;

                        let scoreDetails = this.add.text ( itemW *0.2, itemH*0.55, txt, { fontFamily: 'Oswald', color : '#333'} ).setFontSize ( 26*_scale );
                        
                        miniCont.add ( [ img, rank, photoRect, playerImg, name, scoreDetails ] );


                        this.load.image ( 'playerPhoto' + i, scoresData[i].playerPhotoURL );

                        this.leaderboardContainer.add ( miniCont );

                    }   

                    this.load.once('complete', function () {

                        for ( let i = 0; i  < scoresData.length; i++ ) {

                            var imga = this.add.image ( 0,  itemH/2, 'playerPhoto' + i ).setDisplaySize ( itemH *0.7, itemH *0.7 ).setOrigin (0, 0.5);

                            this.leaderboardContainer.getByName ('cont' + i ).add ( imga );
                        }
                        this.isTopScoresLoaded = true;

                    }, this);


                    this.load.start();

                    this.leaderboardContainer.getByName ('topScoreTxt').destroy();

                }else {

                    this.leaderboardContainer.getByName ('topScoreTxt').setText ("No data returned.");

                    this.isTopScoresLoaded = true;

                }

                console.log ( 'this' );


            }
            showPlayerScore ( plyrData ) {
            
                

                    if ( plyrData != null ) {

                        this.leaderboardContainer.getByName ('plyrScoretxt').destroy();

                        let startX = 123 * _scale,
                            startY = 1013 * _scale;

                        let itemW = 477*_scale, itemH = 120 * _scale;

                        let configTxt = { color : '#000', fontFamily: 'Oswald' };

                        let roundData = JSON.parse( plyrData.data );

                        let miniCont = this.add.container ( startX, startY )

                        let photoRect = this.add.rectangle ( 0,  itemH/2, itemH *0.7, itemH *0.7, 0x3a3a3a, 1 ).setOrigin(0, 0.5).setStrokeStyle(1, 0x9a9a9a );
                        
                        //let img = this.add.image ( itemW *0.08,  itemH/2, 'blank_img' ).setDisplaySize ( itemH *0.7, itemH *0.7 ).setOrigin (0.5);

                        let rank = this.add.text ( itemW, itemH*0.1, '#' + plyrData.rank, configTxt ).setFontSize ( 26*_scale ).setOrigin( 1, 0 );

                        let name = this.add.text ( itemW *0.2,  itemH *0.1, 'You', configTxt ).setFontSize ( 35*_scale );

                        let txt = 'Time : ' + this.convertToTime (plyrData.score) + '  ▪  Moves  : ' + roundData.moves;

                        let scoreDetails = this.add.text ( itemW *0.2, itemH*0.55, txt, { fontFamily: 'Oswald', color : '#333'} ).setFontSize ( 26*_scale );
                        
                        let imga = this.add.image ( 0,  itemH/2, 'dude' ).setDisplaySize ( itemH *0.7, itemH *0.7 ).setOrigin (0, 0.5);

                        ///let imga = this.add.image ( itemW *0.08,  itemH/2, 'dude' ).setDisplaySize ( itemH *0.7, itemH *0.7 ).setOrigin (0.5);

                        miniCont.add ( [ rank, photoRect, imga, name, scoreDetails ] );

                        this.leaderboardContainer.add ( miniCont );

                        
                    
                    }else {

                        this.leaderboardContainer.getByName ('plyrScoretxt').setText ('No data returned.');
                        
                    }

                    this.isPlayerScoreLoaded = true;

            }
            getTopScores () {

                /* var fakeData = [

                    { playerName : 'Albert', rank : 1, score : 10, data : JSON.stringify ( { moves:20} ), playerPhotoURL: 'client/assets/images/mock/friend1.png' },
                    { playerName : 'Marlyn', rank : 2, score : 15, data : JSON.stringify ( { moves:20} ), playerPhotoURL: 'client/assets/images/mock/friend2.png'},
                    { playerName : 'Andrew', rank : 3, score : 24, data : JSON.stringify ( { moves:20} ), playerPhotoURL: 'client/assets/images/mock/friend3.png'},
                    { playerName : 'Alo', rank : 4, score : 35, data : JSON.stringify ( { moves:20} ), playerPhotoURL: 'client/assets/images/mock/friend4.png'},
                    { playerName : 'Jared', rank : 5, score : 75, data : JSON.stringify ( { moves:20} ), playerPhotoURL: 'client/assets/images/mock/friend5.png'}
                    
                ]; */

                //this.showTopScores ( fakeData );

                this.leaderboard.once('getscores', function (scores)
                {
                    this.showTopScores ( scores );

                }, this);

                this.leaderboard.getScores(5);

            }
            getPlayerScore () {


                /* 

                var playerFakeData = { playerName : 'Charlou', rank : 1, score : _bestScores.time[ this.gmLvl - 1], data : JSON.stringify ( { moves: _bestScores.moves[ this.gmLvl - 1]} ), playerPhotoURL: 'client/assets/images/profilepic.jpg' };
                    
                this.showPlayerScore ( playerFakeData );

                 */
                 

                this.leaderboard.once('getplayerscore', function ( playerScore )
                {
                    this.showPlayerScore ( playerScore );

                }, this);

                this.leaderboard.getPlayerScore(); 

               

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
                let txtConfiga = { color : "#fff", fontFamily : 'Oswald', fontSize : 38*_scale };

                let txtVal = '';

                if (_bestScores.time [ this.gmLvl - 1 ] == 0 ) {
                    txtVal = 'No current record to display.'
                }else {
                    txtVal = 'Time: ' + this.convertToTime(_bestScores.time [this.gmLvl -1]) + '   Moves: ' +  this.convertMove (_bestScores.moves [this.gmLvl - 1]);
                }

                let txt = this.add.text ( _gW/2, 610*_scale, txtVal, txtConfiga ).setOrigin ( 0.5 );

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

                this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.8).setOrigin (0).setInteractive();

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

                    let xp = 215 * _scale, upr = 2 * _scale;

                    let txtConfigb = { color : '#fff', fontSize : 32 * _scale, fontFamily : 'Oswald' };

                    //logo and records..
                    let endlogo_new = this.add.sprite ( x_logo, y_new, 'endlogo', 1 ).setScale (_scale);

                    let txtvala = 'Time: '+ this.convertToTime(this.totalSeconds) + '  Moves: ' + this.convertMove ( this.moves);

                    let txtnew = this.add.text ( xp, y_new-upr , txtvala, txtConfigb ).setOrigin (0, 0.5);


                    let endlogo_old = this.add.sprite ( x_logo, y_old, 'endlogo', 0 ).setScale (_scale);

                    let txtvalb = '';

                    if ( data.prevTime != 0 ) {
                        txtvalb = 'Time: '+ this.convertToTime(data.prevTime) + '  Moves: ' + this.convertMove (data.prevMove);
                    }else {
                        txtvalb = 'No previous record'
                    }
                     
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

                    this.scene.removePrompt ();
                    

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

                        _this.bgRect.destroy();

                        _this.promptScreen.destroy();

                        _this.showLeaderboard();

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
            gameFinished () {

                this.tilesContainer.iterate ( function (tile) {

                    tile.removeInteractive();

                });

                //this.skipBtn[1].disableInteractive ().setAlpha (0.5);
                //this.skipBtn[2].disableInteractive ().setAlpha (0.5);

                //this.removeTiles();

                //todo...


            }
            showBestScores () {

                this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.8).setOrigin (0).setInteractive();

                this.promptScreen = this.add.container (-_gW, 0);

                let img = this.add.image (_gW/2, _gH/2, 'table').setScale(_scale);

                let close = this.add.image ( 605*_scale, 455*_scale, 'btn_thumbs', 0 ).setScale(_scale * 0.7).setInteractive();

                close.on ('pointerover', function () {
                    this.setTint ( 0xffff99 );
                });
                close.on ('pointerout', function () {
                    this.clearTint();
                });
                close.on ('pointerup', function () {
                    this.clearTint();
                });
                close.on ('pointerdown', function () {

                    this.playSound ('clicka');
                    
                    this.removeScores ();

                }, this);

                this.promptScreen.add ([img, close]);

                let _this = this;

                this.tweens.add ({
                    targets : this.promptScreen,
                    x : 0,
                    duration : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic',
                    onComplete : function () {
                        _this.showPlayerData ();
                    }
                });

                this.gameTimer.paused=true;

            }
            showPlayerData  () {

                //initial player data...
                let itemW = _gW,
                    itemH = 59 * _scale,
                    itemX = 0,
                    itemY = 555 * _scale;

                let contntH = this.lvlCount * itemH,
                    contnrH = itemH * 5;

                this.dataContainer = this.add.container ( 0, 0 );
                
                
                let txtConfiga = { color : '#333', fontSize : itemH * 0.5, fontFamily : 'Oswald'  };

                for ( var i = 0; i < this.lvlCount ; i++ ) {

                    let miniCont = this.add.container ( itemX, itemY + i * ( itemH ) ).setName ('item' + i );

                    let bgRect = this.add.rectangle ( 0, 0, itemW, itemH).setOrigin (0); //.setStrokeStyle(1, 0x0a0a0a);

                    let lvl = this.add.text ( itemW * 0.21, itemH/2, (i+1) < 10 ? '0' + (i+1) : i+1, txtConfiga  ).setOrigin (0.5);
                    
                    let timeval = _bestScores.time[i] != 0 ? this.convertToTime ( _bestScores.time[i] ) : '--'; 

                    let timetxt = this.add.text ( itemW * 0.5, itemH/2, timeval, txtConfiga ).setOrigin (0.5).setName ('timetxt');

                    let movesVal = _bestScores.moves[i] != 0 ? _bestScores.moves[i] : '--';

                    let movestxt = this.add.text ( itemW * 0.79, itemH/2, movesVal, txtConfiga ).setOrigin (0.5).setName ('movestxt');

                    miniCont.add ([bgRect, lvl, timetxt, movestxt]);

                    //console.log ( i );
                    this.dataContainer.add (miniCont);

                }


                this.zone = this.add.zone(0, itemY, _gW, contnrH).setOrigin(0).setInteractive();

                this.zone.on('pointermove', function (pointer) {

                    if (pointer.isDown)
                    {

                        let dist = pointer.position.y - pointer.prevPosition.y;
                        
                        this.dataContainer.y += ( dist * 3 );

                        this.dataContainer.y = Phaser.Math.Clamp(this.dataContainer.y, -( contntH - contnrH ), 0);
                        
                    }  
                    
                    //console.log ('..');

                }, this );
                    
                    
                
                //setMask..
                var shape = this.make.graphics();

                shape.beginPath();
        
                shape.fillRect( itemX, itemY, _gW, 298 * _scale );

                var mask = shape.createGeometryMask(); 

                this.dataContainer.setMask ( mask )


            }
            removeScores () {

                let _this = this;

                this.dataContainer.destroy();
                
                this.zone.destroy();

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
                        if ( this.gmLvl >= this.lvlCount ) return;
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

                //this.facebook.removeListener ('getleaderboard');

                this.gameTimer.destroy ();

                this.bgmusic.stop ();

                this.scene.start ('HomeScreen');

            }

        }

        class TileRaw extends Phaser.GameObjects.Container {

            constructor ( scene, id, x, y, width, height, cnt, gp, r, c) {

                super ( scene, x, y );

                this.setSize ( width, height ).setName (id);

                this.id = id;
                this.cnt = cnt;
                this.gp = gp;
                this.isOpen = false;
                this.isRevealed = false;
                this.r = r;
                this.c = c;

                let tileimg = scene.add.image ( 0, 0, 'tiles', 0 ).setScale ( width/158 );

                let contimg = scene.add.image ( 0,0, 'thumbs', cnt ).setScale ( width/75 *0.9 ).setVisible ( false );

                //gp + 1
                let tileNumber = scene.add.text ( width*0.35, -height*0.4, gp + 1, { color:'#fff', fontSize: height * 0.25, fontFamily : 'Oswald'}).setOrigin (1, 0);

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
            setGrid ( r, c ) {

                this.r = r;
                this.c = c;

                //this.getAt ( 1 ).setText ( this.r + ":" + this.c + ' (' + this.gp +')' )
            }


        } 

    
        var config = {
            type: Phaser.AUTO,
            width: _gW,
            height: _gH,
            parent: 'game-div',
            backgroundColor: '#f5f5f5',
            scene: [ Preloader, HomeScreen, GameScreen ]
        };
        
    
        new Phaser.Game(config);
    
    });
 
}