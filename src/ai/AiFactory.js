import { AiDifficulty } from './AiDifficulty';

import DefaultAI from './DefaultAI';

export default class AiFactory {
    aiList = [];
    
    constructor() {
        this.aiList = [
            //{ name: '#difficulty.hard', class: DefaultAI, difficulty: AiDifficulty.Hard },
            { name: '#difficulty.medium', class: DefaultAI, difficulty: AiDifficulty.Medium },
            { name: '#difficulty.easy', class: DefaultAI, difficulty: AiDifficulty.Easy },
            
            //{ name: 'legacy', class: LegacyAI },
            //{ name: 'Dummy', class: DummyAI }
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
            if (typeof this.aiList[index].difficulty !== 'undefined') {
                return new this.aiList[index].class(width, height, victoryCondition, this.aiList[index].difficulty);
            } else {
                return new this.aiList[index].class(width, height, victoryCondition);
            }
        }
        console.error('AiFactory.getAi: Index out of bounds');
    }
}