
window.onload = function () {

    FBInstant.initializeAsync().then(function() {

        let _gW = document.getElementById('game_div').clientWidth, 
            _gH = Math.ceil (16/9 * _gW);

        let _scale = _gW/720;

        //console.log ( _gW, _gH, _scale );

        let _bestScores = [ 0, 0, 0 ];

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
                

                this.load.spritesheet('thumbs', 'assets/images/spritesheet.png', { frameWidth: 70, frameHeight: 70 });

                this.load.spritesheet('tiles', 'assets/images/tiles.png', { frameWidth: 158, frameHeight: 158 });

                this.load.spritesheet('btns2', 'assets/images/btns.png', { frameWidth: 322, frameHeight: 82 });

                this.load.spritesheet('best_btn', 'assets/images/best_btn.png', { frameWidth: 645, frameHeight: 89 });

                this.load.spritesheet ('skip_btn', 'assets/images/skip_btn.png', { frameWidth: 50, frameHeight: 50 });


                this.load.image ('bg', 'assets/images/bg.png');

                this.load.image ('bg1', 'assets/images/bg1.png');

                this.load.image ('title', 'assets/images/title.png');

                this.load.image ('table', 'assets/images/table.png');

                this.load.image ('click', 'assets/images/click.png');

                this.load.image ('panel', 'assets/images/panel.png');

                this.load.image ('home_btn', 'assets/images/home_btn.png');

                this.load.image ('prompt', 'assets/images/prompt.png');

                this.load.image ('best_scores', 'assets/images/best_scores.png');


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
                this.initHomeSound ();
                this.initHomeInterface ();

                this.getScores ();

            }
            initHomeSound () {

                this.bgmusic = this.sound.add('bgsound').setVolume(0.1).setLoop(true);
                this.bgmusic.play();
                this.music = this.sound.addAudioSprite('sfx');

            }
            initHomeInterface () {


                //set graphics..

                const bg = this.add.image (_gW/2, _gH/2, 'bg').setScale (_gW/720);

                const title = this.add.image (_gW/2, _gH/2 -_gH/2, 'title').setScale (_gW/720);

                this.tweens.add ({
                    targets : title,
                    y : _gH/2,
                    duration : 1000,
                    easeParams : [ 1, 0.8 ],
                    ease : 'Elastic'
                });

                const click = this.add.image (_gW/2, _gH/2, 'click').setScale (_gW/720);


                //set player details..

                let ry = _gH * 0.48, rz = 120 * _scale;

                this.add.rectangle ( _gW/2, ry, rz, rz, 0xdedede, 1 ).setStrokeStyle ( 3, 0xf5f5f5 );

                this.add.text (_gW/2, ry + (90*_scale), 'Welcome, ' + this.facebook.playerName + '!', { fontFamily:'Oswald', fontSize: 25*_scale, color : '#fff' }).setOrigin (0.5);

                this.add.image ( _gW/2, ry, 'dude').setDisplaySize( rz, rz);


                //set table..

                const table = this.add.image (_gW/2, _gH/2, 'table').setScale (_gW/720);

                let gp = _gW * 0.27,
                    sX = _gW * 0.23,
                    sY = _gH * 0.775;

                this.scoresTxt = [];

                for ( let i = 0; i < _bestScores.length ; i++ ) {

                    let txt = this.add.text ( sX + i* gp, sY, '00', { color : '#333', fontSize : _gH * 0.07, fontFamily : 'Coda'  } ).setOrigin (0.5);

                    this.scoresTxt.push ( txt );

                }

                let rect = this.add.rectangle ( _gW/2, _gH/2, _gW, _gH ).setInteractive ();
            
                rect.once ('pointerdown', function () {
                    
                    //this.removeInteractive();

                    this.scene.music.play('clicka');

                    this.scene.initGame ();
                
                });


            }
            getScores () {


               

                this.facebook.on('savestats', function (data) {

                    //  Handle what the game should do after the stats have saved
                
                });
                
                this.facebook.on('savestatsfail', function (error) {
                
                    //  Handle what the game should do if the stats fail to save
                
                });

                this.facebook.on('savedata', function (data) {

                    //  Handle what the game should do when the data saves
                    console.log ('save data successful..');
                });
                
                this.facebook.on('savedatafail', function (error) {
                
                    //  Handle what the game should do if the data fails to save
                    console.log ('error saving data..');
                });


                this.facebook.getData('plyrScore');
                



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

                this.initSound ();

                this.initGameInterface ();

                this.initGame ();

            }
            initSound () {

                this.music = this.sound.addAudioSprite('sfx');

                this.bgmusic = this.sound.add('bgsound2').setVolume(0.1).setLoop(true);
                this.bgmusic.play();

            }
            initGameInterface () {

                const bg = this.add.image (_gW/2, _gH/2, 'bg1').setScale (_gW/720);

                const panel = this.add.image (_gW/2, _gH/2, 'panel').setScale (_gW/720);

                const configlvlTxt = {
                    color : '#fff',
                    fontFamily : 'Oswald',
                    fontSize : Math.floor ( 40 * _gH/1280)
                }

                let txty = 150 * _scale;
                
                this.lvlText = this.add.text ( _gW * 0.12, txty , 'Level : 1', configlvlTxt ).setOrigin (0,0.5);
                
                this.lvlText.setShadow  ( 0, 2, '#000', 3, false, true );

                this.movText = this.add.text ( _gW * 0.88, txty, 'Moves : 0', configlvlTxt ).setOrigin (1,0.5);

                this.movText.setShadow  ( 0, 2, '#000', 3, false, true );

            
                const best_btn = this.add.image (_gW/2, _gH * 0.9, 'best_btn').setScale (_gW/720).setInteractive();

                best_btn.on('pointerover', function () {
                    this.setFrame (1);
                });
                best_btn.on('pointerout', function () {
                    this.setFrame (0);
                });
                best_btn.on('pointerdown', function () {
                    //..
                    this.scene.playSound ('clicka')
                    this.scene.showBestScores();
                });


                this.controlBtns = [];

                const btns = ['Home', 'Back', 'Skip'];

                let skpW = 120 * _scale,
                    skpH = 40 * _scale,
                    skpS = skpW * 0.1,
                    skpX = (35 * _scale) + skpW/2;

                for ( let i = 0; i < btns.length; i++ ) {


                    let xp = skpX + i * (skpW+skpS),
                        yp = (70 * _scale);

                    let miCont = this.add.container ( xp, yp ).setSize ( skpW, skpH ).setData('id', i ).setInteractive();


                    let txt = this.add.text ( 0, 0, btns [i], { fontFamily:'Oswald', fontSize: skpH * 0.7, color : '#fff'}).setOrigin ( 0, 0.5 );

                    let skip = this.add.image ( -30 * _scale, 0, 'skip_btn' , i ).setScale (_scale);

                    miCont.add ([skip, txt]);

                    miCont.on('pointerover', function () {
                        this.getAt(0).setTint ( 0xffff66 );
                        this.getAt(1).setTint ( 0xffff66 );
                    });
                    miCont.on('pointerout', function () {
                        this.getAt(0).clearTint();
                        this.getAt(1).clearTint();
                    });
                    miCont.on('pointerup', function () {
                        this.getAt(0).clearTint();
                        this.getAt(1).clearTint();
                    });
                    
                    miCont.on('pointerdown', function () {

                        this.scene.controlsClick ( this.getData ('id') );
                        
                    });

                    this.controlBtns.push ( miCont );
                }


            }
            initGame () {

                this.openTiles = [];
                
                let r = this.gmData[this.gmLvl - 1].r,
                    c = this.gmData[this.gmLvl - 1].c;

                this.scoreTotal = r * c / 2;

                this.score = 0;

                this.moves = 0;

                this.lvlText.text = 'Level : ' + this.gmLvl;
                this.movText.text = 'Moves : ' + this.moves;

                this.createTiles ( r, c );

                this.controlBtns[1].disableInteractive().setAlpha(0.3);
                this.controlBtns[2].disableInteractive().setAlpha(0.3);

                this.time.delayedCall ( 800, function () {
                    if ( this.gmLvl > 1 ) this.controlBtns[1].setInteractive().setAlpha(1);
                    if ( this.gmLvl < 3 ) this.controlBtns[2].setInteractive().setAlpha(1);
                }, [], this);


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
                let frames = this.generateFrames ( row*col );

                for ( let i = 0 ; i < row; i++ ) {

                    for ( let j = 0 ; j < col; j++ ) {

                        let xp = sX + j * (tileW + tileS),
                            yp = sY + i * (tileW + tileS);

                        const data = {
                            id : counter,
                            content : frames [counter] + 1,
                            gridPost : counter,
                            isOpen : false,
                            isRevealed : false,
                        };

                        const miniCont = this.add.container ( _gW/2, _gH/2 ).setSize (tileW, tileW).setData(data);

                        const tile = this.add.image (0, 0, 'tiles' ).setScale (tileW/158);
                        
                        const img = this.add.image (0,0, 'thumbs', 0 ).setScale (tileW/70 * 0.75).setVisible(true);

                        //counter + 1

                        const txt = this.add.text ( tileW * 0.35, -tileW * 0.4, counter + 1, {fontSize:tileW*0.2, fontFamily:'Oswald', color:'#fff' }  ).setOrigin (1, 0);
                        txt.setShadow (0,2,'#f00', 2, false, true);

                        miniCont.add ([tile, img, txt]);

                        miniCont.on('pointerover', function () {
                            this.getAt (0).setFrame (1);
                        });
                        miniCont.on('pointerout', function () {
                            this.getAt (0).setFrame (0);
                        });
                        miniCont.on('pointerdown', function () {

                            if ( this.scene.halt ) return;

                            this.removeInteractive();

                            this.getAt (0).setFrame (2);

                            this.getAt (1).setFrame ( this.getData('content'));

                            this.getAt (2).setVisible (false);

                            this.setData ('isOpen', true );

                            this.scene.playSound ('pick');

                            this.scene.tileClick ( { id :this.getData('id'), content : this.getData('content')} );

                        });

                        this.tweens.add ({
                            targets : miniCont,
                            x : xp, y : yp,
                            duration : 500,
                            easeParams : [1.5, 1],
                            ease : 'Elastic',
                            onComplete : function () {
                                this.targets [0].setInteractive();
                            }
                        });

                        this.grid.push ({ 'x':xp, 'y':yp });

                        this.tiles.push (miniCont);
                        
                        this.tilesContainer.add ( miniCont );

                        counter++;
                    }
                }

                this.playSound ('move');

            }
            removeTiles () {
                this.tilesContainer.destroy ();
            }
            tileClick ( data ) {
                
                this.openTiles.push ( data );

                this.moves += 1;
                this.movText.text = 'Moves : ' + this.moves;

                if ( this.openTiles.length >= 2 ) { 

                    this.halt = true;
                    this.analyzeData ();
                }

            }
            analyzeData () {

                if ( this.openTiles [0].content == this.openTiles[1].content ) {
                    
                    let tile1 = this.tiles [ this.openTiles[0].id ],
                        tile2 = this.tiles [ this.openTiles[1].id ];

                    tile1.setData('isRevealed', true );
                    tile2.setData('isRevealed', true );

                    this.tweens.add ({
                        targets : [ tile1, tile2 ],
                        scaleX : 1.1,
                        scaleY : 1.1,
                        duration : 100,
                        yoyo : true,
                        //delay : 100,
                        ease : 'Cubic.easeIn'
                    });

                    this.halt = false;
                    this.openTiles = [];

                    this.score += 1;

                    if ( this.score == this.scoreTotal) {

                        this.registerScore ();

                        this.showPrompt( this.gmLvl == 3 );

                        this.time.delayedCall ( 300, function () {
                            this.playSound ( this.gmLvl != 3 ? 'home' : 'alternate', 0.4 );
                        }, [], this)
                        

                    }else {

                        this.time.delayedCall ( 300, function () {
                            this.playSound ('bleep', 0.4 )
                        }, [], this)
                        
                    }

                }else {

                    this.time.delayedCall ( 300, function () {

                        this.shakeUpGrid ();

                        this.playSound ('move', 0.4 )

                    }, [], this)
                    
                    this.time.delayedCall ( 1000, function () {

                        for ( let i = 0; i < this.openTiles.length; i++ ) {
                            
                            let tilee =  this.tiles [ this.openTiles[i].id ];

                            tilee.getAt(0).setFrame (0);

                            tilee.getAt(1).setFrame (0);

                            tilee.getAt(2).setVisible (true);

                            tilee.setData('isOpen', false );

                            tilee.setInteractive();
                        }               

                        this.halt = false;

                        this.openTiles = [];

                    }, [], this)
                    

                }
            }
            shakeUpGrid () {

                let drt = 200;
                
                if ( this.gmLvl == 1 ) {

                    let tile1 = this.tiles [ this.openTiles[0].id ],
                        tile2 = this.tiles [ this.openTiles[1].id ];

                    let grid1 = tile1.getData('gridPost');
                    let grid2 = tile2.getData('gridPost');
                    
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

                    tile1.setData ('gridPost', grid2);
                    tile2.setData ('gridPost', grid1);
                    
                }
                else if ( this.gmLvl == 2)  {

                    //get tiles and push to temp arr..
                    var tempArr = [];

                    for ( let i in this.tiles ) {

                        let tiles = this.tiles [i];

                        if ( !tiles.getData ('isRevealed') && !tiles.getData('isOpen') ) {
                            tempArr.push ( tiles.getData('id') );
                        }
                    }

                    //randomize..
                    while ( tempArr.length > 2 ) {

                        let randomIndex = Math.floor ( Math.random() * tempArr.length );

                        tempArr.splice ( randomIndex, 1);
                    }

                    //and set..
                    for ( let i in this.openTiles ) {

                        let tilea = this.tiles [ this.openTiles[i].id ],
                            tileb = this.tiles [ tempArr [i] ];

                        let gridPosa = tilea.getData('gridPost'),
                            gridPosb = tileb.getData('gridPost');

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


                        tilea.setData('gridPost', gridPosb);
                        tileb.setData('gridPost', gridPosa);
                        
                    }

                }
                else {

                    let tempArr = [];
                    for ( let i in this.tiles ) {
                        tempArr.push ( this.tiles[i].getData('gridPost') );
                    }

                    //randomize..
                    let gridArr = [];

                    while ( tempArr.length > 0 ) {

                        let randomIndex = Math.floor ( Math.random() * tempArr.length );

                        gridArr.push ( tempArr[randomIndex] );

                        tempArr.splice ( randomIndex, 1);
                    }

                    //and set..
                    let counter = 0;
                    for ( let i in this.tiles ) {
                        this.tweens.add ({
                            targets : this.tiles [i],
                            x : this.grid [gridArr [counter]].x,
                            y : this.grid [gridArr [counter]].y,
                            duration : 500,
                            ease : 'Power3' 
                        });

                        this.tiles [i].setData ('gridPost', gridArr[counter]);

                        counter++;
                    }
                }
                
            }
            generateFrames ( total ) {


                //let total = this.row * this.col;

                let arr = [];
                for ( let i=0; i<23; i++) {
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
            registerScore () {

                
                let currentBest = _bestScores [ this.gmLvl - 1];

                if ( currentBest == 0 || this.moves < currentBest ) {
                    _bestScores [this.gmLvl - 1] = this.moves;
                }

            }
            showPrompt ( end = false ) {

                this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.7).setOrigin (0).setInteractive();

                this.promptScreen = this.add.container (-_gW, 0).setDepth (999);

                let img = this.add.image (_gW/2, _gH/2, 'prompt').setScale(_gW/720);

                let txtConfig = { fontSize : Math.floor (45 * _gH/1280), color : '#ffffff', fontFamily : 'Coda'};

                let str = !end ? "Awesome!" : "Congratulations!";

                let txt = this.add.text ( _gW/2, _gH * 0.47, str, txtConfig ).setOrigin (0.5);

                let btnFrame = !end ? 0 : 2;

                let btn = this.add.image (_gW/2, _gH * 0.57, 'btns2', btnFrame ).setData('id', btnFrame ).setScale(_gW/720).setInteractive();

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

                this.promptScreen.add ([img, txt, btn]);

                this.tweens.add ({
                    targets : this.promptScreen,
                    x : 0,
                    duration : 300,
                    delay : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic'
                });
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
            showBestScores () {

                this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.7).setOrigin (0).setInteractive();

                this.bgRect.on ('pointerdown', function () {

                    this.scene.playSound ('clicka');
                    
                    this.scene.removeScores ();
                });

                this.promptScreen = this.add.container (-_gW, 0).setDepth (999);

                const img = this.add.image (_gW/2, _gH/2, 'best_scores').setScale(_gW/720);

                this.promptScreen.add (img);

                const configtxt = {
                    color : '#dedede',
                    fontFamily : 'Coda',
                    //fontStyle : 'bold',
                    fontSize : _gH * 0.07
                }

                let gp = _gW * 0.27,
                    sX = _gW * 0.23,
                    sY = _gH * 0.55;

                
                for ( let i = 0; i < 3; i++ ) {

                    let strNumbr = _bestScores[i] < 10 ? '0' + _bestScores[i] : _bestScores[i];

                    let txt = this.add.text ( sX + i* gp, sY, strNumbr, configtxt ).setOrigin (0.5);

                    this.promptScreen.add (txt);
                }


                this.tweens.add ({
                    targets : this.promptScreen,
                    x : 0,
                    duration : 300,
                    easeParams : [0.5, 1],
                    ease : 'Elastic'
                });


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
                    }
                });


            }
            controlsClick ( id ) {

                this.playSound ('clicka');

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
                
                this.removeTiles();

                this.initGame ();

            }
            playSound (id , vol = 0.6) {
            this.music.play (id, { volume : vol })
            }
            leaveGame () {

                this.bgmusic.stop ();

                this.scene.start ('HomeScreen');

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