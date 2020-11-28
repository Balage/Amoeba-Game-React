import { AiDifficulty } from './AiDifficulty';
import { LanguageContext } from '../LanguageContext'

import DefaultAI from './DefaultAI';
import LegacyAI from './LegacyAI';
import DummyAI from './DummyAI';

export default class AiFactory {
    aiList = [];
    
    constructor() {
        this.aiList = [
            //{ name: 'Hard', class: DefaultAI, difficulty: AiDifficulty.Hard },
            { name: 'Medium', class: DefaultAI, difficulty: AiDifficulty.Medium },
            { name: 'Easy', class: DefaultAI, difficulty: AiDifficulty.Easy },
            
            { name: 'Legacy', class: LegacyAI },
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