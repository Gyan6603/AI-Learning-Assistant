interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

function FeatureCard({
  title,
  description,
  icon,
  onClick,
}: FeatureCardProps) {
  return (
    <div onClick = {onClick} 
        className="p-6 rounded-xl border cursor-pointer hover:shadow-lg transition">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-gray-600">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;