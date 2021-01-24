using System;
using Microsoft.Extensions.Options;

namespace CodeInterviewApp.Tests
{
    public class MyOptions : IOptionsSnapshot<AppSettings>
    {
        private AppSettings _settings;
        public MyOptions()
        {
            _settings = new AppSettings();
            _settings.ConnectionString = "123";
            _settings.Password = "password";
        }
        public AppSettings Value {
            get {
                return _settings;
            }
        }

        public AppSettings Get(string name)
        {
            return _settings;
        }
    }
}
