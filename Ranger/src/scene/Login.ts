class Login extends BaseScene implements eui.UIComponent {
    private that: any = this;
    private loading: Loading;

    private option: eui.Group;
    private bgMusicOff: eui.Image;
    private bgMusicOn: eui.Image;
    private musicOff: eui.Image;
    private musicOn: eui.Image;

    public constructor() {
        super();
    }
    public menuAnimation: egret.tween.TweenGroup;

    protected onCreated() {
        super.onCreated();
        this.loading = Loading.create(this);
        MvsManager.getInstance().logout("");
    }

    private mvsRegisterUserResponse(data): void {
        GameData.userId = data.id;
        GameData.token = data.token;
        GameData.userName = data.id;
        GameData.avatarUrl = data.avatar;
        let result = MvsManager.getInstance().login();
        console.log("login," + new Date());
    }



    private mvsLoginResponse(data): void {
        // if (NetWorkUtil.checkStatsEeception(data.status)) {
        //     return;
        // }
        if (data.status === 200) {
            console.log('response login  ok' + data + new Date());
            Toast.show("登录成功");
            Delay.run(function () {
                SceneManager.showScene(Lobby);
                this.loading.close();
            }.bind(this), 500);
        } else {
            // this.loading.close();
            this.loading.press2close("登录失败,服务器拒绝:code: " + data.status);
            return;
        }
    }
    private mvsInitResponse(status: number): void {
        console.log('response init ok', status);
        this.registerUser();
    }
    public mvsErrorResponse(code, errMsg) {
        if (code === 400 || code === 402) {
            console.warn('[WARN] 400 errcode not be case ');
            this.loading.press2close("异常:code: " + code + ", msg:" + errMsg);
        } else if (405 == code) {
            console.log('[ERR] 405 该房间已经人满了 ' + errMsg);
            Toast.show("该房间已经人满了");
        } else if (509 == code) {
            console.log('[ERR] 509 该观战房间已经人满了 ' + errMsg);
            Toast.show("该观战房间已经人满了");
        } else if (604 == code) {
            console.log('[ERR] 604 该观战房间游戏已结束 ' + errMsg);
            Toast.show("游戏已结束");
        }
        else {
            console.info('[ERROR] mvsErrorResponse', arguments);
            this.loading.press2close("异常:code: " + code + ", msg:" + errMsg, function () {
                NetWorkUtil.checkStatsEeception(code);
            }.bind(this));
            Toast.show("异常:code: " + code + ", msg:" + errMsg);

        }
    }

    public registerUser() {
        MvsManager.getInstance().registerUser();
    }
    public mvsBind() {
        MvsManager.response.registerUserResponse = this.mvsRegisterUserResponse.bind(this);
        MvsManager.response.loginResponse = this.mvsLoginResponse.bind(this);
        MvsManager.response.errorResponse = this.mvsErrorResponse.bind(this);
    }
    public onClick(name: string, v: egret.DisplayObject) {
        if (name == "music") {
            this.initMusicBtn();
            this.option.visible = true;
        }
        else if (name == "close") {
            this.option.visible = false;
        }
        else if (name == "bgMusicOff") {
            GameData.closeBgMusic = false;
            this.bgMusicOff.visible = false;
            this.bgMusicOn.visible = true;
        }
        else if (name == "bgMusicOn") {
            GameData.closeBgMusic = true;
            this.bgMusicOff.visible = true;
            this.bgMusicOn.visible = false;
        }
        else if (name == "musicOff") {
            GameData.closeMusic = false;
            this.musicOff.visible = false;
            this.musicOn.visible = true;
        }
        else if (name == "musicOn") {
            GameData.closeMusic = true;
            this.musicOff.visible = true;
            this.musicOn.visible = false;
        }
        else if (name == "login") {

            this.mvsBind();
            MvsManager.getInstance().uninit();
            MvsManager.response.initResponse = this.mvsInitResponse.bind(this);
            MvsManager.getInstance().init();
            this.loading.show();

        } else if (name == "help") {

            Login.startSingleGame();
        }
        else if (name == "exit") {

            if (window["wx"]) {
                window["wx"].exitMiniProgram({
                    success: function () { },
                    fail: function () { },
                    complete: function () { },
                });
            }
        }
        return true;
    }
    public static startSingleGame() {
        // GameData.setType(-1);
        GameData.type = GameData.p1;
        GameData.initPlayer(GameData.type, 'You', GameData.userId, GameData.avatarUrl);
        // 初始化第二个ranger
        GameData.initPlayer(GameData.p2, 'blue Ranger', -1, '');

        console.log('singleModel player', GameData.getPlayer(GameData.p1))
        SceneManager.showScene(Game, { "isSingleModel": true, "isShowTip": true })
    }
    public initMusicBtn() {
        if (GameData.closeBgMusic) {
            this.bgMusicOff.visible = true;
            this.bgMusicOn.visible = false;
        } else {
            this.bgMusicOff.visible = false;
            this.bgMusicOn.visible = true;
        }

        if (GameData.closeMusic) {
            this.musicOff.visible = true;
            this.musicOn.visible = false;
        } else {
            this.musicOff.visible = false;
            this.musicOn.visible = true;
        }
    }

    public onHide() {
        this.option.visible = false;
        Delay.cancel();
    }
}