type InputProps = { type: string; name: string; placeholder: string; className?: string; value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void };
export const FpInput: React.FC<InputProps> = (props) => <input {...props} />;
