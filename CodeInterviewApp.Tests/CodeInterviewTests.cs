using dotnetcore.Controllers;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace CodeInterviewApp.Tests
{
    [TestClass]
    public class CodeInterviewTests
    {
        ValuesController values = new ValuesController(new MyOptions());
        DefaultUser user = new DefaultUser();

        private class DefaultUser{
            public string Password = "password";
            public int Id = 123;
            public string Name = "Neil";
        }

        [TestMethod]
        public void Default_Content_Returns_Expected_Results()
        {
            
            var content = values.GetMonacoContent(user.Password,user.Id,false,1,user.Name);

            //expected default values
            Assert.IsTrue(content.num_viewers==1);
            Assert.IsTrue(content.num_editors==0);
            Assert.IsTrue(content.content=="function Run() \r\n{\r\n    return 'Hello World!';\r\n}");
        }

        [TestMethod]
        public void Editor_Returns_Expected_Results()
        {
            
            var content = values.GetMonacoContent(user.Password,user.Id,true,1,user.Name);

            Assert.IsTrue(content.num_viewers==1);
            Assert.IsTrue(content.num_editors==1);
            Assert.IsTrue(content.content=="function Run() \r\n{\r\n    return 'Hello World!';\r\n}");

            content.content = "Hello World";
            content.password = user.Password;
            content.name = user.Name;
            content.id = user.Id;

            var updatedContent = values.PostMonacoContent(content);
            content = values.GetMonacoContent(user.Password,user.Id,true,1,user.Name);

            //content got updated
            Assert.IsTrue(content.content=="Hello World");

            //current version got incremented
            Assert.IsTrue(content.current_version==1);

        }
    }
}
