import { Merger } from "./merger";
import { MonacoContent } from "./models/MonacoContent";
import { User } from "./models/User";

declare var Split;

export class MyApp {


    editor: monaco.editor.IStandaloneCodeEditor;
    password: string = 'maddy';
    title:string = 'Code Interview App';
    post_count: number = 1;
    edit_mode: boolean = false;
    run_updates:boolean = true; //running and stopped button
    stop_updates:boolean = false; //running and stopped button
    message:string='';
    id:number = 0;
    name:string = '';
    num_viewers:number = 0;
    num_editors:number = 0;
    min_height:number = 400;
    height:number = 0;
    ready_to_update:boolean=true; //prevent too many api calls during network congestion

    //co-authoring support
    lastContent:string = null;
    did_code_change:boolean = false;
    show_warning:boolean = false;
    update_counter:number = 0;
    update_interval:number = 0;
    current_version:number = 0;
    users:User[] = [];
    MergerRef:Merger = Merger;

    //mobile device support
    mobile_device=false;

    
    constructor() {

        this.setId();
        this.bindRivets();
        this.calculateInitialHeight();
        this.detectMobileDevice();
        this.setHeight();
        this.configureSplit();
        this.configureMonaco();




    }

    reactTypings: string = '';

    async configureMonaco(){

        var response = await fetch('./node_modules/@types/react/index.d.ts');
        this.reactTypings = await response.text();



        require(['vs/editor/editor.main'], function () {

            var myApp = window["myApp"] as MyApp;

            //set monaco compiler settings
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                jsx: monaco.languages.typescript.JsxEmit.React,
                target: (monaco as any).languages.typescript.ScriptTarget.ES6,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS
            });

            //react typings
            var libSource = myApp.reactTypings;
            var libUri = 'types/react/index.ts';
            monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));

            // Create the editor model
            // needs to be .tsx extension otherwise JSX doesn't work
            var editorModel = monaco.editor.createModel('', 'typescript', monaco.Uri.file('/main.tsx'))

            var options = <monaco.editor.IEditorConstructionOptions>{};
            options.model = editorModel;
            options.value = 'loading...';
            options.language = 'typescript';
            options.theme = 'vs-light';
            options.automaticLayout = true;
            options.readOnly = true;
            options.mouseWheelZoom = true;
            options.glyphMargin = true;
            if (myApp.mobile_device)
            {
                options.glyphMargin = false;
                options.contextmenu = false;
                // options.wordWrap = "on";
                // options.minimap = <monaco.editor.IEditorMinimapOptions>{
                //     enabled: false
                // }
            }
            myApp.editor = monaco.editor.create(document.getElementById('monContainer'), options);

            
            document.getElementById('loadingDiv').style.display='none';
            
            ($("#exampleModal") as any).modal();
            setTimeout(() => {
                //focus on textbox
                $("#txtName").focus();
                //prevent submit on enter 
                $('#txtName').bind("keypress", function(e) {
                    if (e.keyCode == 13) {               
                      e.preventDefault();
                      myApp.showApp();
                      return false;
                    }
                  });
            }, 500);

            //init tooltips
            // ($('[data-toggle="tooltip"]') as any).tooltip();
            

        });
    }

    configureSplit() {
        Split(['.editorLeft', '.editorRight'], {
            gutterSize: 5,
            sizes: [70, 30]
        });
    }

    compileUX() {
        console.log('compiling source...');
        try {
            let source = this.editor.getValue() as string;



            let result = ts.transpileModule(source, {
                compilerOptions: {
                    module: ts.ModuleKind.None,
                    target: ts.ScriptTarget.ES2015,
                    moduleResolution: ts.ModuleResolutionKind.NodeJs,
                    strictNullChecks: true,
                    jsx: ts.JsxEmit.React,
                }
            });

            console.log(result);

            let compileResult = result.outputText;

            //only for JSX
            if (compileResult.indexOf('./types/react') > 0) {
                compileResult = compileResult.substr(compileResult.indexOf('./types/react') + 17);
                compileResult = compileResult.replace(new RegExp('react_1', 'g'), 'React');
                compileResult = compileResult.replace(new RegExp('React.default', 'g'), 'React');
            }


            //execute compiled code
            eval(compileResult);



            this.message = '';

        } catch (error) {
            console.log('Error: ' + error);
            this.message = 'Error: ' + error;
        }
    }

    initializeTooltips(){
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    refreshTooltips(){
        let viewer_names = '';
        let editor_names  = '';
        this.users.forEach((user)=>{ 
            if (user.is_editor)
                editor_names += user.name + ', ';
            else
                viewer_names += user.name + ', ';
        });

        if (viewer_names.endsWith(', ')) viewer_names = viewer_names.substr(0,viewer_names.length-2);
        if (editor_names.endsWith(', ')) editor_names = editor_names.substr(0,editor_names.length-2);
        
        $('#spanViewers').attr('data-original-title', viewer_names);
        $('#spanEditors').attr('data-original-title', editor_names);
    }

    showApp() {
        let form = document.getElementById('nameForm') as HTMLFormElement;
        {
            let isvalid = form.checkValidity();
            if (isvalid) {
                document.getElementById('divMain').style.display = 'block';
                $("#divMain").css('opacity', '1');
                $("#divMessage").show();
                let name = $("#txtName").val() as string;
                name = name.replace(/[^a-zA-Z ]/g,''); //remove illegal characters
                this.name = name;
                this.update();
                //ping server every 5 seconds
                setInterval(() => this.update(), 5000);

                ($('#exampleModal') as any).modal('hide');
                this.initializeTooltips();
            }
            form.classList.add('was-validated');
        }
    }


    calculateInitialHeight() {
        
        
        this.height = window.innerHeight-400;
        if(this.height<this.min_height)
            this.height = this.min_height;
        
    }


    detectMobileDevice(){
        if (window.innerWidth<500)
        {
            document.getElementById('monContainer').style['margin-right'] = '10px';
            document.getElementById('monContainer').style['margin-left'] = '10px';
            this.title = 'Code Interview';
            this.mobile_device = true;
        }
    }

    heightGrow(){
        this.height += 100;
        this.setHeight();
    }

    heightShrink(){
        this.height -= 100;
        this.setHeight();
    }

    chkEditCodeChanged(){
        // myApp.editor.updateOptions({readOnly:true})
        setTimeout(() => {
            this.editor.updateOptions({readOnly:!this.edit_mode});
        }, 50);
    }


    setHeight(){
        // document.getElementById('monContainer').style['min-height']= this.height + 'px';
        // document.getElementById('monContainer').style['max-height']= this.height + 'px';

        document.getElementById('monContainer').style.height = this.height + 'px';
        document.getElementById('divOutput').style.height = this.height + 'px';
        document.getElementById('splitOuter').style.height = this.height + 'px';
    }

    resizeArea() {

    }

    setId() {
        this.id = Math.floor(Math.random() * Math.floor(1000000));
        console.log('ID: ' + this.id);
      }

    bindRivets() {
        rivets.bind($('body'), { data: this });
        
    }

    btnClick() {
        this.getMonacoContent();
    }

    stopUpdate(){
        if (this.run_updates)
        {
            this.run_updates = false;
            this.stop_updates = true;
            console.log('updating stopped');
        }
        else
        {
            this.run_updates = true;
            this.stop_updates = false;
            console.log('updating started');
        }
    }

    btnPost() {
        this.setMonacoContent();
    }

    btnRunCode(){
        this.compileUX();
        // try
        // {
        //     eval(this.editor.getValue() + '  myApp.message = Run();');
        // }catch(error)
        // {
        //     console.log('Error: ' + error);
        //     this.message = 'Error: ' + error;
        // }
    }


    updateTimer(){
        this.update_counter=5;
        if (this.update_interval!=0)
            clearInterval(this.update_interval);
        this.update_interval = setInterval(() => this.update_counter--, 1000);
    }

    async update() {
        this.updateTimer();

        if (this.ready_to_update==false) //last update didn't finish
        {
            console.log('last update didnt finish');
            return;
        }

        this.ready_to_update=false; //prevent multiple updates if last one didn't finish
        try
        {
            this.did_code_change = false;
            if (!this.run_updates)
            {
                this.ready_to_update=true;
                return;
            }
            
            if (this.edit_mode) //edit code mode
            {
                if (this.lastContent==null)
                {
                    this.lastContent = this.editor.getValue();
                    this.did_code_change = true;
                }
                else
                {
                    if (this.lastContent!=this.editor.getValue())
                        this.did_code_change = true;
                }
                if (this.did_code_change) //only post updates to server if something changed
                    await this.setMonacoContent();
                else
                    await this.getMonacoContent();
                this.lastContent = this.editor.getValue(); 
            }
            else //view code mode
            {
                await this.getMonacoContent();
                this.lastContent = null;
            }
            this.post_count++;
            
            //Test of ready_to_update functionality
            //Pausing for 15 seconds to simulate network congestion
            //await new Promise<void>(resolve => {setTimeout(resolve, 15000); }); 
        }
        catch(error)
        {
            console.log('update error', error);
        }
        this.ready_to_update=true;

        this.showMessages()
        this.drawCoAuthoringMarkers();
        this.refreshTooltips();
        
    }

    decorations:string[] = [];

    drawCoAuthoringMarkers(){
        var editors = [];

        if (this.num_editors>0){
            this.users.forEach(user => {
                if (user.is_editor && user.id!=this.id)
                {
                    editors.push({
                        range: new monaco.Range(user.line_number,1,user.line_number,1),
                        options: {
                            isWholeLine: true,
                            className: 'myContentClass',
                            glyphMarginClassName: 'myGlyphMarginClass',
                            glyphMarginHoverMessage: { value: '**Editor:** ' + user.name }                            
                        }
                    });
                }
            });
            this.decorations = this.editor.deltaDecorations(this.decorations, editors);
        }
        else
        {
            this.decorations = this.editor.deltaDecorations(this.decorations, editors);
        }


    }

    
    showMessages(){
        if (this.num_editors>1 && this.edit_mode && !this.mobile_device)
            this.show_warning = true;
        else
            this.show_warning = false;
        // console.log('current version: ' + this.current_version);
    }

    unitTestGetMonacoContent():any {
        var result = $.get('api/values/GetMonacoContent?password=' + this.password + '&id=' + this.id 
            + '&is_editing=' + this.edit_mode + '&line_number=' + this.editor.getPosition().lineNumber
            + '&name=' + this.name);
        return result;
    }

    async getMonacoContent() {
        // console.log('get content');
        
        let out_of_sync = false;
        if (this.current_version==-1)
            out_of_sync = true;

        //there is some bug in here where if the other guy leaves
        //and you start making edits it says
        //merging content even though you should've had latest

        let current_content = this.editor.getValue();
        var result = await $.get('api/values/GetMonacoContent?password=' + this.password + '&id=' + this.id 
            + '&is_editing=' + this.edit_mode + '&line_number=' + this.editor.getPosition().lineNumber
            + '&name=' + this.name) as MonacoContent;
        
        

        this.num_editors = result.num_editors;
        this.num_viewers = result.num_viewers - result.num_editors;
        this.users = result.users;


        

        //don't overwrite if nothing changed
        if (this.editor.getValue()!=result.content)
        {
            //also don't update the code in the unlikely chance that the editor changed
            //between the time it took to get the new content from the server
            let can_update = true;
            if (this.edit_mode && current_content!=this.editor.getValue())
                can_update=false;
            if (can_update)
            {
                this.current_version = result.current_version; //need to set the right key

                let oldposition = this.editor.getPosition();
                if (out_of_sync) //don't have the latest version, attempt merge
                {
                    this.mergeContent(result.content);             
                }
                else
                    this.editor.setValue(result.content);
                this.editor.setPosition(oldposition); //prevent cursor from jumping
                this.compileUX();
            }
        }
        else
            this.current_version = result.current_version; //nothing changed so give the user
                                                           //their token

        
    }


    //point of no return
    //whatever gets merged will
    //end up as the authoritative
    //record on the backend
    async mergeContent(content:string){

        let content1 = this.editor.getValue();
        let content2 = content;

        if (content1!=content2)
        {
            //try to merge content1 and content2
            let merged_content = Merger.MergeContent(content1,content2);
            this.editor.setValue(merged_content);
            await this.setMonacoContent(); //send merged content up to the server immediately
                                           //this needs to be here just in case they shut off the edit code
                                           //checkbox right after they are done making their edit
            console.log('finished merge');
        }
        else
            console.log('nothing to merge');
        

    }


    async setMonacoContent() {

        // console.log('set content');
        let mon_content = new MonacoContent();
        mon_content.content = this.editor.getValue();
        mon_content.current_version = this.current_version;
        mon_content.password = this.password;
        mon_content.id = this.id;
        mon_content.name = this.name;
        mon_content.line_number = this.editor.getPosition().lineNumber;
        var result = await $.ajax({
            url: 'api/values/PostMonacoContent',
            headers: { 'Content-Type': "application/json" },
            method: "POST",
            data: JSON.stringify(mon_content)
        }) as MonacoContent;

        this.num_editors = result.num_editors;
        this.num_viewers = result.num_viewers - result.num_editors;
        this.users = result.users;
        this.current_version = result.current_version;

        this.compileUX();
    }

}

window["myApp"] = new MyApp();