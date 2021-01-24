
using System.Collections.Generic;

namespace dotnetcore.Controllers
{
    public class MonacoContent
    {
        public int id;
        public string name;
        public string content;
        public string password;
        public int num_viewers;
        public int num_editors;
        public int current_version;
        public int line_number;
        public List<User> users = new List<User>();
    }
}
