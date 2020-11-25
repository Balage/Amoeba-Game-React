import DefaultAI from './ai/DefaultAI';
import LegacyAI from './ai/LegacyAI';
import DummyAI from './ai/DummyAI';

export default class AiFactory {
    aiList = [];
    
    constructor() {
        this.aiList = [
            { name: 'Default', class: DefaultAI },
            { name: 'Legacy', class: LegacyAI },
            { name: 'Dummy', class: DummyAI }
        ];
    }
    
    getList() {
        return this.aiList.map(
            (item, index) => ({
                value: index,
                label: item.name
            })
        );
    }
    
    getAi(index, width, height, victoryCondition) {
        if (0 <= index && index < this.aiList.length) {
            return new this.aiList[index].class(width, height, victoryCondition);
        }
        console.error('AiFactory.getAi: Index out of bounds');
    }
}