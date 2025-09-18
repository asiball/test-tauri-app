use ssh2::Session;
use std::io::Read;
use std::net::TcpStream;

pub struct SshClient {
    username: String,
    password: String,
    host: String,
    port: u16,
    sess: Option<Session>,
}

impl SshClient {
    pub fn new<U: Into<String>, H: Into<String>>(
        username: U,
        password: String,
        host: H,
        port: u16,
    ) -> Self {
        SshClient {
            username: username.into(),
            password,
            host: host.into(),
            port,
            sess: None,
        }
    }

    pub fn connect(&mut self) -> Result<(), ssh2::Error> {
        let tcp = TcpStream::connect((self.host.as_str(), self.port))
            .map_err(|_e| ssh2::Error::from_errno(ssh2::ErrorCode::Session(-1)))?;
        let mut session = Session::new().unwrap();

        session.set_tcp_stream(tcp);
        session.handshake()?;
        session.userauth_password(&self.username, &self.password)?;

        self.sess = Some(session);
        Ok(())
    }

    pub fn exec(&self, command: &str) -> Result<String, ssh2::Error> {
        let session = self
            .sess
            .as_ref()
            .ok_or(ssh2::Error::from_errno(ssh2::ErrorCode::Session(-1)))?
            .clone();

        let mut channel = session.channel_session()?;
        channel.exec(command)?;

        let mut output = String::new();
        let _ = channel.read_to_string(&mut output);

        channel.wait_close()?;
        Ok(output)
    }
}
