const { UserService } = require('../src/userService');

describe('UserService - Suíte de Testes Limpos', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve criar um usuário com dados válidos', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado).toBeDefined();
      expect(usuarioCriado.id).toBeDefined();
      expect(usuarioCriado.nome).toBe(nome);
      expect(usuarioCriado.email).toBe(email);
      expect(usuarioCriado.idade).toBe(idade);
      expect(usuarioCriado.status).toBe('ativo');
      expect(usuarioCriado.isAdmin).toBe(false);
    });

    test('deve criar um usuário administrador quando especificado', () => {
      // Arrange
      const nome = 'Admin User';
      const email = 'admin@teste.com';
      const idade = 30;
      const isAdmin = true;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade, isAdmin);

      // Assert
      expect(usuarioCriado.isAdmin).toBe(true);
    });

    test('deve lançar erro ao tentar criar usuário menor de idade', () => {
      // Arrange
      const nome = 'Menor de Idade';
      const email = 'menor@teste.com';
      const idade = 17;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve lançar erro quando nome não for fornecido', () => {
      // Arrange
      const nome = '';
      const email = 'teste@teste.com';
      const idade = 25;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('deve lançar erro quando email não for fornecido', () => {
      // Arrange
      const nome = 'Fulano';
      const email = '';
      const idade = 25;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve buscar um usuário existente pelo ID', () => {
      // Arrange
      const usuarioCriado = userService.createUser('João', 'joao@teste.com', 28);
      const idUsuario = usuarioCriado.id;

      // Act
      const usuarioBuscado = userService.getUserById(idUsuario);

      // Assert
      expect(usuarioBuscado).toBeDefined();
      expect(usuarioBuscado.id).toBe(idUsuario);
      expect(usuarioBuscado.nome).toBe('João');
      expect(usuarioBuscado.email).toBe('joao@teste.com');
    });

    test('deve retornar null quando o usuário não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve desativar um usuário comum com sucesso', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);
      const idUsuario = usuarioComum.id;

      // Act
      const resultado = userService.deactivateUser(idUsuario);

      // Assert
      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(idUsuario);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('não deve desativar um usuário administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);
      const idUsuario = usuarioAdmin.id;

      // Act
      const resultado = userService.deactivateUser(idUsuario);

      // Assert
      expect(resultado).toBe(false);
      const usuarioAtualizado = userService.getUserById(idUsuario);
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('deve retornar false ao tentar desativar usuário inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve gerar relatório quando não há usuários cadastrados', () => {
      // Arrange
      // (banco já está vazio devido ao beforeEach)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('--- Relatório de Usuários ---');
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });

    test('deve gerar relatório contendo informações dos usuários cadastrados', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('--- Relatório de Usuários ---');
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('ativo');
    });

    test('deve incluir usuários inativos no relatório', () => {
      // Arrange
      const usuario = userService.createUser('Carlos', 'carlos@email.com', 25);
      userService.deactivateUser(usuario.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Carlos');
      expect(relatorio).toContain('inativo');
    });
  });
});
