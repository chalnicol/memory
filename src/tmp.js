
window.onload = function () {

    var game, config;

    var _gW = 0, _gH = 0;

    var _bestScores = [ 0, 0, 0 ];

    var form = document.getElementById ('myForm');

    form.onsubmit = function ( e ) {

        e.preventDefault();

        document.getElementById('game_login').style.display = 'none';
        document.getElementById('game_div').style.display = 'block';
        
        enterGame ();
        
    }

    readDeviceOrientation();

    this.addEventListener("orientationchange", function() {
        readDeviceOrientation()
    });

    function readDeviceOrientation () {

        if ( window.orientation == undefined ) return;

        var portrait = Math.abs ( window.orientation) == 90;

        var btn_enter =  document.getElementById('btnEnter');

        btn_enter.disabled = ( portrait ) ? true : false; 

        var message_div =  document.getElementById('messageDiv');

        message_div.innerHTML = ( !portrait ) ? '' : '<small>Please set device orientation to portrait.</small>';

    }

    function enterGame () {

        var maxW = 720;

        var container = document.getElementById('game_container');

        var contW = container.clientWidth,
            contH = container.clientHeight;

        var tmpWidth = contW > maxW ? maxW : contW,
            tmpHeight = Math.ceil(tmpWidth * 16/9);

        console.log ( 'init', tmpHeight, contH )

        var gameH = 0, gameW = 0;

        if ( tmpHeight >= contH ) {

            gameH = contH;
            gameW = Math.ceil(gameH * 9/16);

            console.log ( 'game dimensions adjusted by screen height' )

        }else {

            gameW = tmpWidth;
            gameH = tmpHeight;
            console.log ( 'game dimensions adjusted by screen width' )
        }

        var game_div = document.getElementById('game_div');
        game_div.style.width = gameW + 'px';
        game_div.style.height = gameH + 'px';
        //game_div.style.overflow = 'hidden'
        
        _gW = gameW;
        _gH = gameH;
        
        config = {

            type: Phaser.AUTO,
            width: gameW,
            height: gameH,
            backgroundColor: '#fff',
            audio: {
                disableWebAudio: false
            },
            parent:'game_div',
            scene: [ Intro, SceneB ]

        };

        game = new Phaser.Game(config);

    }

    var Intro = new Phaser.Class({

        Extends: Phaser.Scene,

        initialize:

        function Intro ()
        {
            Phaser.Scene.call(this, { key: 'sceneA' });
        },

        preload: function ()
        {

          
            this.load.audioSprite('sfx', 'client/assets/sfx/fx_mixdown.json', [
                'client/assets/sfx/sfx.ogg',
                'client/assets/sfx/sfx.mp3'
            ]);
            
            this.load.audio ('bgsound', ['client/assets/sfx/bgsound.ogg', 'client/assets/sfx/bgsound.mp3'] );

            this.load.audio ('bgsound2', ['client/assets/sfx/bgsound2.ogg', 'client/assets/sfx/bgsound2.mp3'] );
            

            this.load.spritesheet('thumbs', 'client/assets/images/spritesheet.png', { frameWidth: 70, frameHeight: 70 });

            this.load.spritesheet('tiles', 'client/assets/images/tiles.png', { frameWidth: 158, frameHeight: 158 });

            this.load.spritesheet('btns2', 'client/assets/images/btns.png', { frameWidth: 322, frameHeight: 82 });

            this.load.spritesheet('best_btn', 'client/assets/images/best_btn.png', { frameWidth: 645, frameHeight: 89 });

            this.load.spritesheet ('skip_btn', 'client/assets/images/skip_btn.png', { frameWidth: 50, frameHeight: 50 });


            this.load.image ('bg', 'client/assets/images/bg.png');

            this.load.image ('bg1', 'client/assets/images/bg1.png');

            this.load.image ('title', 'client/assets/images/title.png');

            this.load.image ('table', 'client/assets/images/table.png');

            this.load.image ('click', 'client/assets/images/click.png');

            this.load.image ('panel', 'client/assets/images/panel.png');

            this.load.image ('home_btn', 'client/assets/images/home_btn.png');

            this.load.image ('prompt', 'client/assets/images/prompt.png');

            this.load.image ('best_scores', 'client/assets/images/best_scores.png');


            var rctW = _gW * 0.5, 
                rctH = _gH * 0.025,
                rctX = (_gW - rctW)/2,
                rctY = _gH/2;
        
            var txtConfig = {
                color : "#333",
                fontSize : _gH * 0.02,
                fontFamily : 'Coda'
            }
            this.loadtxt = this.add.text ( _gW/2, _gH * 0.48, 'Loading Files..', txtConfig ) .setOrigin(0.5);
            
            this.loadrect = this.add.rectangle ( rctX, rctY, rctW * 0.02, rctH, 0x9e9e9e, 1 ).setOrigin(0);

            //...
            this.load.on('progress', function (value) {

                var perc = Math.floor ( value * 100 );
                
                this.loadtxt.text = 'Loading Files.. ' + perc + '%';
                
                this.loadrect.width = rctW * value;

            }, this );

            this.load.on('complete', function () {
                this.loadtxt.destroy();
                this.loadrect.destroy();
            }, this );


        },
        create: function () {
            
            //this.loadtxt.destroy();
            //this.loadrect.destroy();
            this.initMenuInterface ();

            this.initMenuSound ();

            
           
        },
        initMenuSound : function () {


            this.bgmusic = this.sound.add('bgsound').setVolume(0.2).setLoop(true);
            this.bgmusic.play();

            this.music = this.sound.addAudioSprite('sfx');

        },
        initMenuInterface : function () {

            var _this = this;

            var bg = this.add.image (_gW/2, _gH/2, 'bg').setScale (_gW/720);

            var title = this.add.image (_gW/2, _gH/2 -_gH/2, 'title').setScale (_gW/720);

            this.tweens.add ({
                targets : title,
                y : _gH/2,
                duration : 1000,
                easeParams : [ 1, 0.8 ],
                ease : 'Elastic'
            });

            var table = this.add.image (_gW/2, _gH/2, 'table').setScale (_gW/720);

            var configtxt = {
                color : '#3a3a3a',
                fontFamily : 'Coda',
                //fontStyle : 'bold',
                fontSize : _gH * 0.07
            }

            var gp = _gW * 0.27,
                sX = _gW * 0.23,
                sY = _gH * 0.775;

            
            for ( var i = 0; i < _bestScores.length ; i++ ) {

                var strNumbr = _bestScores[i] < 10 ? '0' + _bestScores[i] : _bestScores[i];

                var txt = this.add.text ( sX + i* gp, sY, strNumbr, configtxt ).setOrigin (0.5);
            }

            var click = this.add.image (_gW/2, _gH/2, 'click').setScale (_gW/720);

            var rect = this.add.rectangle ( _gW/2, _gH/2, _gW, _gH ).setInteractive ();
        
            rect.once ('pointerdown', function () {
                
                //this.removeInteractive();

                _this.music.play('clicka');

                _this.initGame ();
            
            });

            //this.music.play ('move');

        },
        initGame : function () {
            
            
            this.bgmusic.stop();

            var _this = this;

            setTimeout(() => {

                _this.scene.start( 'sceneB' );

            }, 500 );
            
        }

    });

    var SceneB = new Phaser.Class({

        Extends: Phaser.Scene,

        initialize:

        function SceneB ()
        {
            Phaser.Scene.call(this, { key: 'sceneB' });
        },

        preload: function ()
        {
            //..
        },
        create: function ()
        {
            
            this.openTiles = [];

            this.halt = false;
            
            this.gmLvl = 1;

           
            this.gmData = [{ r : 5, c : 4 }, { r : 6, c : 5 }, { r : 7, c : 6 } ];

            this.initSound ();

            this.initGameInterface ();

            this.initGame ();

        },
        initSound : function () {

            this.music = this.sound.addAudioSprite('sfx');

            this.bgmusic = this.sound.add('bgsound2').setVolume(0.2).setLoop(true);
            this.bgmusic.play();

        },
        initGameInterface : function () {

            var _this = this;

            var bg = this.add.image (_gW/2, _gH/2, 'bg1').setScale (_gW/720);

            var panel = this.add.image (_gW/2, _gH/2, 'panel').setScale (_gW/720);

            var configlvlTxt = {
                color : '#fff',
                fontFamily : 'Coda',
                fontSize : Math.floor ( 35 * _gH/1280)
            }

            this.lvlText = this.add.text ( _gW * 0.12, _gH * 0.103 , 'Level : 1', configlvlTxt ).setOrigin (0,0.5);
            
            this.lvlText.setShadow  ( 0, 2, '#000', 3, false, true );

            this.movText = this.add.text ( _gW * 0.88, _gH * 0.103 , 'Moves : 0', configlvlTxt ).setOrigin (1,0.5);

            this.movText.setShadow  ( 0, 2, '#000', 3, false, true );

           
            var best_btn = this.add.image (_gW/2, _gH * 0.9, 'best_btn').setScale (_gW/720).setInteractive();

            best_btn.on('pointerover', function () {
                this.setFrame (1);
            });
            best_btn.on('pointerout', function () {
                this.setFrame (0);
            });
            best_btn.on('pointerdown', function () {
                //..
                _this.playSound ('clicka')
                _this.showBestScores();
            });

            var txt = this.add.text ( _gW/2, _gH * 0.9, 'Show Best Moves', {fontSize:30*_gW/720, fontFamily:'Coda', color:'#fff'}).setOrigin(0.5);
            
            txt.setShadow  ( 0, 2, '#000', 3, false, true );

            var homebtn = this.add.image (_gW * 0.05, _gH * 0.02, 'home_btn').setScale (_gW/720).setOrigin(0).setInteractive();

            homebtn.on('pointerover', function () {
                this.setTint (0xff6a6a);
            });
            homebtn.on('pointerout', function () {
                this.clearTint();
            });
            homebtn.on('pointerdown', function () {
                //..

                _this.playSound ('clicka')

                _this.leaveGame();

            });


            this.skipBtn = [];

            var skpZ = Math.floor ( 50 * _gW/720 ),
                skpS = skpZ * 0.3;

            for ( var i = 0; i < 2; i++ ) {

                var ids = i == 0 ? 'prev' : 'next';

                var skip = this.add.image ((_gW * 0.77 ) + i * (skpZ+skpS), _gH * 0.02, 'skip_btn' , i ).setScale (_gW/720).setData('id', ids).setOrigin(0).setInteractive();
                skip.on('pointerover', function () {
                    this.setTint (0xff6a6a);
                });
                skip.on('pointerout', function () {
                    this.clearTint();
                });
                skip.on('pointerdown', function () {
                    
                     _this.playSound ('clicka')

                    _this.navigateToLevel ( this.getData ('id') );
                });

                this.skipBtn.push ( skip );

            }

        },
        initGame : function () {

            this.openTiles = [];
            
            var r = this.gmData[this.gmLvl - 1].r,
                c = this.gmData[this.gmLvl - 1].c;

            this.scoreTotal = r * c / 2;

            this.score = 0;

            this.moves = 0;

            this.lvlText.text = 'Level : ' + this.gmLvl;
            this.movText.text = 'Moves : ' + this.moves;

            this.createTiles ( r, c );

            var _this = this;

            setTimeout(() => {

                _this.skipBtn[0].setInteractive().setAlpha(1);
                _this.skipBtn[1].setInteractive().setAlpha(1);

                if ( _this.gmLvl == 1 ) {
                    _this.skipBtn[0].disableInteractive().setAlpha (0.5);
                }
                if ( _this.gmLvl == 3 ) {
                    _this.skipBtn[1].disableInteractive().setAlpha (0.5);;
                }
                
            }, 500 );

        },
        createTiles : function ( row, col ) {

            this.grid = [];

            this.tiles = [];

            this.tilesContainer = this.add.container ( 0, 0 );

            var totlW = _gW * 0.88,
                tempW = totlW/col,
                tileW = tempW * 0.98,
                tileS = tempW - tileW,
                sX = ( _gW - totlW )/2 + tileW/2,
                sY =  ( _gH - (tempW*row) - tileS )/2 + tileW/2;

            var _this = this;

            var counter = 0;

            //generate frames..
            var frames = this.generateFrames ( row*col );

            for ( var i = 0 ; i < row; i++ ) {

                for ( var j = 0 ; j < col; j++ ) {

                    var xp = sX + j * (tileW + tileS),
                        yp = sY + i * (tileW + tileS);

                    var data = {
                        id : counter,
                        content : frames [counter ] + 1,
                        gridPost : counter,
                        isOpen : false,
                        isRevealed : false,
                    };

                    var miniCont = this.add.container ( _gW/2, _gH/2 ).setSize (tileW, tileW).setData(data);

                    var tile = this.add.image (0, 0, 'tiles' ).setScale (tileW/158);
                    
                    var img = this.add.image (0,0, 'thumbs', 0 ).setScale (tileW/70 * 0.75).setVisible(true);

                    var txt = this.add.text ( tileW * 0.35, -tileW * 0.4, counter + 1, {fontSize:tileW*0.2, fontFamily:'Coda', color:'#fff' }  ).setOrigin (1, 0);
                    txt.setShadow (0,2,'#f00', 2, false, true);

                    miniCont.add ([tile, img, txt]);

                    miniCont.on('pointerover', function () {
                        this.getAt (0).setFrame (1);
                    });
                    miniCont.on('pointerout', function () {
                        this.getAt (0).setFrame (0);
                    });
                    miniCont.on('pointerdown', function () {

                        if ( _this.halt ) return;

                        this.removeInteractive();

                        this.getAt (0).setFrame (2);

                        this.getAt (1).setFrame ( this.getData('content'));

                        this.getAt (2).setVisible (false);

                        this.setData ('isOpen', true );

                        _this.playSound ('pick');

                        _this.tileClick ( { id :this.getData('id'), content : this.getData('content')} );

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

        },
        removeTiles : function () {
            this.tilesContainer.destroy ();
        },
        tileClick : function ( data ) {
            
            this.openTiles.push ( data );

            if ( this.openTiles.length >= 2 ) { 

                this.moves += 1;
                this.movText.text = 'Moves : ' + this.moves;

                this.halt = true;
                this.analyzeData ();
            }

        },
        analyzeData : function () {

            var _this = this;

            if ( this.openTiles [0].content == this.openTiles[1].content ) {
                
                var tile1 = this.tiles [ this.openTiles[0].id ],
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

                    setTimeout(() => {
                        _this.playSound ( this.gmLvl != 3 ? 'home' : 'alternate');
                    }, 300);

                }else {

                    setTimeout(() => {
                        _this.playSound ('bleep')
                    }, 300 );

                }

            }else {

                //console.log ('err');
                setTimeout(() => {

                    _this.shakeUpGrid ();

                    _this.playSound ('move', 0.4 )

                }, 300 );

                setTimeout (() => {

                    for ( var i = 0; i < _this.openTiles.length; i++ ) {
                        
                        var tilee =  _this.tiles [ _this.openTiles[i].id ];

                        tilee.getAt(0).setFrame (0);
    
                        tilee.getAt(1).setFrame (0);

                        tilee.getAt(2).setVisible (true);

                        tilee.setData('isOpen', false );

                        tilee.setInteractive();
                    }               

                    _this.halt = false;
    
                    _this.openTiles = [];

                }, 1000);

            }
        },
        shakeUpGrid : function () {

            var drt = 200;
            
            if ( this.gmLvl == 1 ) {

                var tile1 = this.tiles [ this.openTiles[0].id ],
                    tile2 = this.tiles [ this.openTiles[1].id ];

                var grid1 = tile1.getData('gridPost');
                var grid2 = tile2.getData('gridPost');
                
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

                for ( var i in this.tiles ) {

                    var tiles = this.tiles [i];

                    if ( !tiles.getData ('isRevealed') && !tiles.getData('isOpen') ) {
                        tempArr.push ( tiles.getData('id') );
                    }
                }

                //randomize..
                while ( tempArr.length > 2 ) {

                    var randomIndex = Math.floor ( Math.random() * tempArr.length );

                    tempArr.splice ( randomIndex, 1);
                }

                //and set..
                for ( var i in this.openTiles ) {

                    var tilea = this.tiles [ this.openTiles[i].id ]
                        tileb = this.tiles [ tempArr [i] ];

                    var gridPosa = tilea.getData('gridPost'),
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

                var tempArr = [];
                for ( var i in this.tiles ) {
                    tempArr.push ( this.tiles[i].getData('gridPost') );
                }

                //randomize..
                var gridArr = [];

                while ( tempArr.length > 0 ) {

                    var randomIndex = Math.floor ( Math.random() * tempArr.length );

                    gridArr.push ( tempArr[randomIndex] );

                    tempArr.splice ( randomIndex, 1);
                }

                //and set..
                var counter = 0;
                for ( var i in this.tiles ) {
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
            
        },
        generateFrames : function( total ) {


            //var total = this.row * this.col;

            var arr = [];
            for ( var i=0; i<23; i++) {
                arr.push ( i );
            }

            var tmp_arr = [];
            while (tmp_arr.length < (total/2) ) {

                var randomIndex = Math.floor ( Math.random() * arr.length );

                tmp_arr.push ( arr[randomIndex] );

                arr.splice ( randomIndex, 1);

            }

            arr = [];

            for ( var i=0; i<tmp_arr.length ; i++) {
                arr.push ( tmp_arr[i] );
                arr.push ( tmp_arr[i] );
            }

            //return arr;

            var finArr = [];
            while ( arr.length > 0 ) {

                var randomIndex = Math.floor ( Math.random() * arr.length );

                finArr.push ( arr[randomIndex] );

                arr.splice ( randomIndex, 1);
            }

            return finArr;
            
        },
        registerScore : function () {

            
            var currentBest = _bestScores [ this.gmLvl - 1];

            if ( currentBest == 0 || this.moves < currentBest ) {
                _bestScores [this.gmLvl - 1] = this.moves;
            }

        },
        showPrompt : function ( end = false ) {

            var _this = this;

            this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.7).setOrigin (0).setInteractive();

            this.promptScreen = this.add.container (-_gW, 0).setDepth (999);

            var img = this.add.image (_gW/2, _gH/2, 'prompt').setScale(_gW/720);

            var txtConfig = { fontSize : Math.floor (45 * _gH/1280), color : '#ffffff', fontFamily : 'Coda'};

            var str = !end ? "Awesome!" : "Congratulations!";

            var txt = this.add.text ( _gW/2, _gH * 0.47, str, txtConfig ).setOrigin (0.5);

            var btnFrame = !end ? 0 : 2;

            var btn = this.add.image (_gW/2, _gH * 0.57, 'btns2', btnFrame ).setData('id', btnFrame ).setScale(_gW/720).setInteractive();

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
                _this.playSound ('clicka');

                if ( _this.gmLvl != 3 ) {
                    _this.removePrompt ();
                }else {
                    _this.leaveGame();
                }

            });

            this.promptScreen.add ([ img, txt, btn]);

            this.tweens.add ({
                targets : this.promptScreen,
                x : 0,
                duration : 300,
                delay : 300,
                easeParams : [0.5, 1],
                ease : 'Elastic'
            });


        },
        removePrompt : function () {

            var _this = this;

            this.tweens.add ({
                targets : this.promptScreen,
                x : _gW,
                duration : 300,
                easeParams : [0.5, 1],
                ease : 'Elastic',
                onComplete : function () {
                    _this.promptScreen.destroy ();
                    _this.bgRect.destroy();
                    if ( _this.gmLvl < 3) {
                        _this.gmLvl += 1;
                        _this.changeLevel ();
                    }
                }
            });

        },
        showBestScores : function () {

            var _this = this;

            this.bgRect = this.add.rectangle (0,0, _gW, _gH, 0x0a0a0a, 0.7).setOrigin (0).setInteractive();

            this.bgRect.on ('pointerdown', function () {
                _this.playSound ('clicka');
                
                _this.removeScores ();
            });

            this.promptScreen = this.add.container (-_gW, 0).setDepth (999);

            var img = this.add.image (_gW/2, _gH/2, 'best_scores').setScale(_gW/720);

            this.promptScreen.add (img);

            var configtxt = {
                color : '#dedede',
                fontFamily : 'Coda',
                //fontStyle : 'bold',
                fontSize : _gH * 0.07
            }

            var gp = _gW * 0.27,
                sX = _gW * 0.23,
                sY = _gH * 0.55;

            
            for ( var i = 0; i < 3; i++ ) {

                var strNumbr = _bestScores[i] < 10 ? '0' + _bestScores[i] : _bestScores[i];

                var txt = this.add.text ( sX + i* gp, sY, strNumbr, configtxt ).setOrigin (0.5);

                this.promptScreen.add (txt);
            }


            this.tweens.add ({
                targets : this.promptScreen,
                x : 0,
                duration : 300,
                easeParams : [0.5, 1],
                ease : 'Elastic'
            });


        },
        removeScores :  function () {

            var _this = this;

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


        },
        navigateToLevel : function ( id ) {

            switch (id) {
                case 'prev': 
                    if ( this.gmLvl == 1 ) return;
                    this.gmLvl += -1;
                    break;
                case 'next':
                    if ( this.gmLvl == 3 ) return;
                    this.gmLvl += 1;
                    break;
            }

            this.changeLevel ();
        },
        changeLevel : function () {
            
            for ( var i in this.skipBtn ) {
                this.skipBtn[i].disableInteractive ().setAlpha (0.5);
            }
            
            this.removeTiles();

            this.initGame ();

        },
        playSound (id , vol = 0.6) {
           this.music.play (id, { volume : vol })
        },
        leaveGame : function () {

            this.bgmusic.stop ();

            this.scene.start ('sceneA');

        }

    });


} 
