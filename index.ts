import { Model, BuildOptions, Op, IndexesOptions } from 'sequelize';

type ModelContructor = typeof Model & {
    new (values?: object, options?: BuildOptions): Model;
}

interface Query { [key: string]: any; }

export class Basic {
    private Entity: ModelContructor;
    constructor(Entity: ModelContructor) {
        this.Entity = Entity;
    }

    // 查找一个实例
    async findOne(id: string): Promise<Model> {
        return this.Entity.findOne({
            where: {
                id: {
                    [Op.eq]: id
                }
            }
        });
    }

    // 查找一组实例
    async findAll(query: Query): Promise<Model[]> {
        const searchOptions: IndexesOptions = {
            where: {}
        }

        for (const [column, value] of Object.entries(query)) {
            if (Array.isArray(value)) {
                query.where[column] = {
                    [Op.in]: value
                }
            } else {
                query.where[column] = {
                    [Op.eq]: value
                }
            }
        }

        return this.Entity.findAll(searchOptions);

    }

    // 更新一个实例
    async update(id: string, query: Query): Promise<[number, Model[]]> {
        const [numbers, entities] = await this.Entity.update(query, {
            where: {
                id: {
                    [Op.eq]: id
                }
            },
            returning: true
        });

        return [numbers, entities];
    }

    // 删除一个实例
    async remove(id: string, removeField: string = 'isDeleted'): Promise<[number, Model[]]> {
        const [numbers, entities] = this.Entity.update({
            [removeField]: true
        }, {
            where: {
                id: {
                    [Op.eq]: id
                }
            },
            returning: true
        });

        return [numbers, entities];
    }
}

