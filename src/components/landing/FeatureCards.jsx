import { features } from '../../data/features'
import FeatureCard from './FeatureCard'
export default function FeatureCards() { return <div className="feature-cards">{features.map((feature, index) => <FeatureCard key={feature.title} {...feature} index={index} />)}</div> }
