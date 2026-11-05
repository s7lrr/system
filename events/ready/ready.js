const Data = require("pro.db");

module.exports = async (client) => {
    console.table({
        Name: client.user.tag,
        Ping: client.ws.ping,
        Prefix: client.prefix,
        ID: client.user.id,
        Server: client.guilds.cache.size,
        Members: client.users.cache.size,
        Channels: client.channels.cache.size,
        Developer: "foga team"
    });

console.log(`
    
                                                                                                                                                                      
                                                                                                                                                                 
                                                                                                                                                                 
    ffffffffffffffff                                                                   tttt                                                                      
   f::::::::::::::::f                                                               ttt:::t                                                                      
  f::::::::::::::::::f                                                              t:::::t                                                                      
  f::::::fffffff:::::f                                                              t:::::t                                                                      
  f:::::f       ffffffooooooooooo      ggggggggg   ggggg aaaaaaaaaaaaa        ttttttt:::::ttttttt        eeeeeeeeeeee    aaaaaaaaaaaaa      mmmmmmm    mmmmmmm   
  f:::::f           oo:::::::::::oo   g:::::::::ggg::::g a::::::::::::a       t:::::::::::::::::t      ee::::::::::::ee  a::::::::::::a   mm:::::::m  m:::::::mm 
 f:::::::ffffff    o:::::::::::::::o g:::::::::::::::::g aaaaaaaaa:::::a      t:::::::::::::::::t     e::::::eeeee:::::eeaaaaaaaaa:::::a m::::::::::mm::::::::::m
 f::::::::::::f    o:::::ooooo:::::og::::::ggggg::::::gg          a::::a      tttttt:::::::tttttt    e::::::e     e:::::e         a::::a m::::::::::::::::::::::m
 f::::::::::::f    o::::o     o::::og:::::g     g:::::g    aaaaaaa:::::a            t:::::t          e:::::::eeeee::::::e  aaaaaaa:::::a m:::::mmm::::::mmm:::::m
 f:::::::ffffff    o::::o     o::::og:::::g     g:::::g  aa::::::::::::a            t:::::t          e:::::::::::::::::e aa::::::::::::a m::::m   m::::m   m::::m
  f:::::f          o::::o     o::::og:::::g     g:::::g a::::aaaa::::::a            t:::::t          e::::::eeeeeeeeeee a::::aaaa::::::a m::::m   m::::m   m::::m
  f:::::f          o::::o     o::::og::::::g    g:::::ga::::a    a:::::a            t:::::t    tttttte:::::::e         a::::a    a:::::a m::::m   m::::m   m::::m
 f:::::::f         o:::::ooooo:::::og:::::::ggggg:::::ga::::a    a:::::a            t::::::tttt:::::te::::::::e        a::::a    a:::::a m::::m   m::::m   m::::m
 f:::::::f         o:::::::::::::::o g::::::::::::::::ga:::::aaaa::::::a            tt::::::::::::::t e::::::::eeeeeeeea:::::aaaa::::::a m::::m   m::::m   m::::m
 f:::::::f          oo:::::::::::oo   gg::::::::::::::g a::::::::::aa:::a             tt:::::::::::tt  ee:::::::::::::e a::::::::::aa:::am::::m   m::::m   m::::m
 fffffffff            ooooooooooo       gggggggg::::::g  aaaaaaaaaa  aaaa               ttttttttttt      eeeeeeeeeeeeee  aaaaaaaaaa  aaaammmmmm   mmmmmm   mmmmmm
                                                g:::::g                                                                                                          
                                    gggggg      g:::::g                                                                                                          
                                    g:::::gg   gg:::::g                                                                                                          
                                     g::::::ggg:::::::g                                                                                                          
                                      gg:::::::::::::g                                                                                                           
                                        ggg::::::ggg                                                                                                             
                                           gggggg                                                                                                                                                                                                                            
                                                                                                                                                                  
        
              Website: https://foga.rmz.gg/
             Discord: https://discord.gg/foga

    `)

    client.commands.forEach(command => {
        const aliases = Data.get(`aliases_${command.name}`);
        if (aliases) {  
            command.aliases = aliases;
            client.commands.set(command.name, command);
        }
    });
};
