import { ArrowDownCircle, Eraser, Pencil, Redo, Undo } from "lucide-react";
import styles from './index.module.css'

const Menu=()=>{

    return(
<div className={styles.menuContainer}>
    <div className={styles.iconWrapper}>
<Pencil className={styles.icon}/>
    </div>
    <div className={styles.iconWrapper}>
   <Eraser className={styles.icon}/>
    </div>
    <div className={styles.iconWrapper}>
 <Undo className={styles.icon}/>
    </div>
    <div className={styles.iconWrapper}>
    <Redo className={styles.icon}/>
    </div>
    <div className={styles.iconWrapper}>
   <ArrowDownCircle className={styles.icon} />
    </div>
</div>
    )
}


export default Menu;