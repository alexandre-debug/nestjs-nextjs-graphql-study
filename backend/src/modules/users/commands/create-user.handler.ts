/**
 * Handler do comando CreateUser.
 *
 * O Handler contém a LÓGICA DE NEGÓCIO para executar o comando.
 * Separar Command (intenção) de Handler (execução) facilita:
 * - Testes unitários do handler isoladamente
 * - Substituição da implementação sem alterar quem dispara o comando
 * - Adicionar middleware no CommandBus (ex: logging, autorização)
 */
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserCommand } from './create-user.command';
import { User, UserRole } from '../entities/user.entity';
import { EmailAlreadyExistsException } from '../../../common/exceptions/business.exception';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // EventBus: permite publicar eventos de domínio após a operação.
    // Aqui poderíamos publicar um UserCreatedEvent para outros módulos reagirem.
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { name, email, role } = command;

    // Verificação de regra de negócio: e-mail deve ser único
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new EmailAlreadyExistsException(email);
    }

    const user = this.userRepository.create({
      name,
      email,
      role: role as UserRole,
    });

    const saved = await this.userRepository.save(user);

    // Aqui publicaríamos um evento de domínio, ex:
    // this.eventBus.publish(new UserCreatedEvent(saved.id, saved.email));
    // Outros módulos escutariam e reagiriam (ex: enviar e-mail de boas-vindas)

    return saved;
  }
}
