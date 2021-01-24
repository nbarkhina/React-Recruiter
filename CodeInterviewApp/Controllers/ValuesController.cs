using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;

namespace dotnetcore.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        public int DemoContent = 0;
        public static List<User> Users = new List<User>();
        public static string EditorContent =
        @"import React, { Component } from './types/react';

declare var ReactDOM;

//state class
class MyReactState {
    message = '';
}

//main component
class MyReactApp extends Component<{}, MyReactState>{
    constructor(props) {
        super(props);
        this.state = new MyReactState();
    }

    buttonClicked() {
        this.setState({ message:'Button Clicked' });
    }

    render() {

        return (
            <div className=""container"">
                <h1>React Example</h1>
                <button className=""btn btn-primary"" onClick={this.buttonClicked.bind(this)}>Click Me</button>
                <div style={{marginTop:'20px'}}>{this.state.message}</div>
            </div>
        );
    }
}

ReactDOM.render(React.createElement(MyReactApp), document.getElementById('divOutput'));";

        public static int Current_Version = 0;
        private AppSettings Settings;
        public ValuesController(IOptionsSnapshot<AppSettings> settings)
        {
            Settings = settings.Value;
            CONN_STRING = Settings.ConnectionString;
        }
        string CONN_STRING = "";


        private void UpdateUsers(int ID, string name, bool is_editor, int line_number)
        {
            try
            {
                List<User> to_remove = new List<User>();
                var found = false;
                foreach (var user in Users)
                {
                    if (user.id == ID)
                    {
                        user.last_updated = DateTime.Now;
                        user.is_editor = is_editor;
                        user.line_number = line_number;
                        found = true;
                    }
                    if (user.last_updated.AddSeconds(30) < DateTime.Now)
                        to_remove.Add(user);
                    Console.WriteLine("ID: " + user.id + " LastUpdated: " + user.last_updated.ToString());
                }
                if (!found)
                    Users.Add(new User() { id = ID, last_updated = DateTime.Now,
                        is_editor = is_editor, line_number = line_number, name=name });
                foreach (var user in to_remove)
                {
                    Users.Remove(user);
                }

            }
            catch { }

        }

        [HttpGet("GetMonacoContent")]
        public MonacoContent GetMonacoContent(string password, int id, bool is_editing, 
            int line_number,string name)
        {
            // Console.WriteLine("Hello");
            // Console.WriteLine("ID: " + id);

            MonacoContent return_content = new MonacoContent();
            if (password != Settings.Password)
            {
                return_content.content = "Wrong Password";
                return return_content;
            }
            UpdateUsers(id, name, is_editing, line_number);
            return_content.num_viewers = Users.Count;
            return_content.num_editors = Users.Where((viewer) => viewer.is_editor).Count();
            return_content.users = Users;

            return_content.content = EditorContent;
            return_content.current_version=Current_Version;
            return return_content;

        }

        

        [HttpPost("PostMonacoContent")]
        public MonacoContent PostMonacoContent([FromBody] MonacoContent monContent)
        {
            MonacoContent return_content = new MonacoContent();
            if (monContent.password != Settings.Password)
            {
                return_content.content = "Wrong Password";
                return return_content;
            }
            UpdateUsers(monContent.id, monContent.name, true,monContent.line_number);
            return_content.num_viewers = Users.Count;
            return_content.num_editors = Users.Where((viewer) => viewer.is_editor).Count();
            return_content.users = Users;

            if (monContent.current_version==Current_Version)
            {
                EditorContent = monContent.content;
                Current_Version++;
                return_content.current_version = Current_Version;
            }
            else
                return_content.current_version=-1;

            return return_content;
        }



        // // PUT api/values/5
        // [HttpPut("{id}")]
        // public void Put(int id, [FromBody] string value)
        // {
        // }

        // // DELETE api/values/5
        // [HttpDelete("{id}")]
        // public void Delete(int id)
        // {
        // }
    }
}
